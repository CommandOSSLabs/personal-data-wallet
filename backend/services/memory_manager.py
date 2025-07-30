import json
import os
from typing import Dict, List, Optional, Any
from models import KnowledgeGraph, IntentType
from services.vector_store import VectorStore
from services.gemini_embeddings import GeminiEmbeddingService as EmbeddingService
from services.sui_client import SuiClient
from services.walrus_client import WalrusClient

class MemoryManager:
    def __init__(self):
        self.embedding_service = EmbeddingService()
        self.sui_client = SuiClient()
        self.walrus_client = WalrusClient()
        self.user_stores: Dict[str, VectorStore] = {}
        self.user_graphs: Dict[str, Dict[str, Any]] = {}

    def get_or_create_vector_store(self, user_id: str) -> VectorStore:
        if user_id not in self.user_stores:
            self.user_stores[user_id] = VectorStore()
            # Try to load existing data
            store_path = f"data/{user_id}_vector_store"
            if os.path.exists(f"{store_path}.hnsw") and os.path.exists(f"{store_path}.meta"):
                try:
                    self.user_stores[user_id].load_from_file(store_path)
                except Exception as e:
                    print(f"Failed to load vector store for {user_id}: {e}")
        return self.user_stores[user_id]

    def get_or_create_knowledge_graph(self, user_id: str) -> Dict[str, Any]:
        if user_id not in self.user_graphs:
            # Try to load existing graph
            graph_path = f"data/{user_id}_graph.json"
            if os.path.exists(graph_path):
                try:
                    with open(graph_path, 'r') as f:
                        self.user_graphs[user_id] = json.load(f)
                except Exception as e:
                    print(f"Failed to load knowledge graph for {user_id}: {e}")
                    self.user_graphs[user_id] = {"nodes": [], "edges": []}
            else:
                self.user_graphs[user_id] = {"nodes": [], "edges": []}
        return self.user_graphs[user_id]

    async def add_fact(self, user_id: str, text: str, knowledge_graph: KnowledgeGraph) -> bool:
        try:
            # Get or create vector store
            vector_store = self.get_or_create_vector_store(user_id)
            
            # Create embedding for the text
            embedding = await self.embedding_service.create_embedding(text)
            
            # Add to vector store
            vector_store.add_embedding(embedding)
            
            # Update knowledge graph
            user_graph = self.get_or_create_knowledge_graph(user_id)
            
            # Merge new nodes and edges
            existing_nodes = set(user_graph.get("nodes", []))
            existing_edges = set(tuple(edge.items()) for edge in user_graph.get("edges", []))
            
            new_nodes = set(knowledge_graph.nodes)
            new_edges = set(tuple(edge.dict().items()) for edge in knowledge_graph.edges)
            
            # Update graph
            user_graph["nodes"] = list(existing_nodes.union(new_nodes))
            user_graph["edges"] = [dict(edge) for edge in existing_edges.union(new_edges)]
            
            # Save locally
            await self._save_user_data(user_id)
            
            # Trigger Sui contract
            await self._trigger_sui_ingest(user_id, knowledge_graph.dict(), embedding.vector)
            
            return True
            
        except Exception as e:
            print(f"Failed to add fact for {user_id}: {e}")
            return False

    async def query_memory(self, user_id: str, query_text: str, k: int = 5) -> List[str]:
        try:
            # Get vector store
            vector_store = self.get_or_create_vector_store(user_id)
            
            # Create embedding for query
            query_embedding = await self.embedding_service.create_embedding(query_text)
            
            # Search similar texts
            results = vector_store.search(query_embedding.vector, k=k)
            
            # Extract just the texts
            similar_texts = [text for text, similarity in results if similarity > 0.5]
            
            return similar_texts
            
        except Exception as e:
            print(f"Failed to query memory for {user_id}: {e}")
            return []

    async def get_context_for_query(self, user_id: str, query_text: str) -> Dict[str, Any]:
        # Get similar texts from vector search
        similar_texts = await self.query_memory(user_id, query_text)
        
        # Get knowledge graph
        user_graph = self.get_or_create_knowledge_graph(user_id)
        
        # Extract relevant graph nodes based on query
        query_words = set(query_text.lower().split())
        relevant_nodes = []
        relevant_edges = []
        
        for node in user_graph.get("nodes", []):
            if any(word in node.lower() for word in query_words):
                relevant_nodes.append(node)
        
        # Get edges involving relevant nodes
        for edge in user_graph.get("edges", []):
            if edge.get("source") in relevant_nodes or edge.get("target") in relevant_nodes:
                relevant_edges.append(edge)
        
        return {
            "similar_texts": similar_texts,
            "relevant_graph": {
                "nodes": relevant_nodes,
                "edges": relevant_edges
            }
        }

    async def _save_user_data(self, user_id: str):
        # Ensure data directory exists
        os.makedirs("data", exist_ok=True)
        
        # Save vector store
        if user_id in self.user_stores:
            store_path = f"data/{user_id}_vector_store"
            self.user_stores[user_id].save_to_file(store_path)
        
        # Save knowledge graph
        if user_id in self.user_graphs:
            graph_path = f"data/{user_id}_graph.json"
            with open(graph_path, 'w') as f:
                json.dump(self.user_graphs[user_id], f, indent=2)

    async def _trigger_sui_ingest(self, user_id: str, graph_data: Dict[str, Any], vector: List[float]):
        try:
            # Convert graph data to JSON string
            graph_json = json.dumps(graph_data)
            
            # Call Sui contract
            result = await self.sui_client.ingest_memory(user_id, graph_json, vector)
            
            if result.get("success"):
                print(f"Successfully triggered Sui ingest for user {user_id}")
                
                # Store data on Walrus (simulated)
                vector_cert = await self.walrus_client.store_vector_index({
                    "user_id": user_id,
                    "vector_data": "serialized_vector_store_data"
                })
                
                graph_cert = await self.walrus_client.store_knowledge_graph(graph_data)
                
                # Finalize on Sui
                if vector_cert and graph_cert:
                    await self.sui_client.finalize_update(user_id, vector_cert, graph_cert)
            else:
                print(f"Failed to trigger Sui ingest for user {user_id}: {result}")
                
        except Exception as e:
            print(f"Error triggering Sui ingest: {e}")

    async def close(self):
        await self.sui_client.close()
        await self.walrus_client.close()