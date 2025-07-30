import asyncio
import json
import logging
import numpy as np
import hnswlib
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime
import pickle
import os
from dataclasses import dataclass, asdict
from services.walrus_client import WalrusClient
from services.sui_client import SuiClient
from config import settings

logger = logging.getLogger(__name__)

@dataclass
class IndexedEmbedding:
    """Represents an indexed embedding with metadata."""
    embedding_id: str
    owner: str
    walrus_hash: str
    metadata_vector: List[float]
    category: str
    ibe_identity: str
    timestamp: str
    
    def to_dict(self) -> Dict:
        return asdict(self)

class HNSWIndexerService:
    """
    Service that listens to Sui events and maintains HNSW index for fast metadata search.
    Implements the indexer component from the architecture flow.
    """
    
    def __init__(self,
                 vector_dimension: int = 768,  # Google embedding-001 dimension
                 max_elements: int = 100000,
                 ef_construction: int = 200,
                 m: int = 16):
        self.vector_dimension = vector_dimension
        self.max_elements = max_elements
        self.ef_construction = ef_construction
        self.m = m
        
        # Initialize HNSW index
        self.index = hnswlib.Index(space='cosine', dim=vector_dimension)
        self.index.init_index(max_elements=max_elements, ef_construction=ef_construction, M=m)
        
        # Metadata storage (maps index ID to embedding metadata)
        self.metadata_store: Dict[int, IndexedEmbedding] = {}
        self.embedding_id_to_index: Dict[str, int] = {}
        self.next_index_id = 0
        
        # Services
        self.sui_client = SuiClient()
        self.walrus_client = WalrusClient()
        
        # Configuration
        self.index_backup_interval = getattr(settings, 'index_backup_interval', 3600)  # 1 hour
        self.sui_event_poll_interval = getattr(settings, 'sui_event_poll_interval', 5)  # 5 seconds
        
        # State
        self.is_running = False
        self.last_processed_checkpoint = 0
        
        logger.info(f"Initialized HNSW indexer with dimension {vector_dimension}")
    
    async def start(self):
        """Start the indexer service."""
        self.is_running = True
        logger.info("Starting HNSW indexer service...")
        
        # Load existing index if available
        await self.load_index_from_storage()
        
        # Start background tasks
        tasks = [
            asyncio.create_task(self.event_listener_loop()),
            asyncio.create_task(self.backup_loop())
        ]
        
        try:
            await asyncio.gather(*tasks)
        except Exception as e:
            logger.error(f"Error in indexer service: {e}")
            raise
    
    async def stop(self):
        """Stop the indexer service."""
        self.is_running = False
        logger.info("Stopping HNSW indexer service...")
        
        # Save index before stopping
        await self.backup_index_to_storage()
        
        # Close clients
        await self.sui_client.close()
        await self.walrus_client.close()
    
    async def event_listener_loop(self):
        """Main loop that listens for Sui events."""
        while self.is_running:
            try:
                # Poll for new events from Sui
                events = await self.fetch_new_events()
                
                for event in events:
                    await self.process_event(event)
                
                await asyncio.sleep(self.sui_event_poll_interval)
                
            except Exception as e:
                logger.error(f"Error in event listener loop: {e}")
                await asyncio.sleep(self.sui_event_poll_interval * 2)  # Back off on error
    
    async def backup_loop(self):
        """Background loop that periodically backs up the index."""
        while self.is_running:
            try:
                await asyncio.sleep(self.index_backup_interval)
                await self.backup_index_to_storage()
            except Exception as e:
                logger.error(f"Error in backup loop: {e}")
    
    async def fetch_new_events(self) -> List[Dict]:
        """Fetch new EmbeddingAdded events from Sui."""
        try:
            # This would call the actual Sui RPC to get events
            # For now, simulate with empty list
            events = await self.sui_client.get_events_since_checkpoint(
                self.last_processed_checkpoint,
                event_type="EmbeddingAdded"
            )
            
            if events:
                # Update checkpoint
                self.last_processed_checkpoint = max(
                    event.get('checkpoint', 0) for event in events
                )
            
            return events
            
        except Exception as e:
            logger.error(f"Failed to fetch events: {e}")
            return []
    
    async def process_event(self, event: Dict):
        """Process a single EmbeddingAdded event."""
        try:
            event_data = event.get('data', {})
            
            # Extract event information
            embedding_id = event_data.get('embedding_id')
            owner = event_data.get('owner')
            walrus_hash = event_data.get('walrus_hash')
            metadata_vector = event_data.get('metadata_vector', [])
            category = event_data.get('category')
            ibe_identity = event_data.get('ibe_identity')
            timestamp = event_data.get('timestamp')
            
            if not all([embedding_id, owner, walrus_hash, metadata_vector]):
                logger.warning(f"Incomplete event data: {event_data}")
                return
            
            # Convert metadata vector to numpy array
            # Note: Sui stores as u64, need to convert to float
            vector_array = np.array([float(x) / 1000000.0 for x in metadata_vector], dtype=np.float32)
            
            # Normalize vector for cosine similarity
            norm = np.linalg.norm(vector_array)
            if norm > 0:
                vector_array = vector_array / norm
            
            # Add to index
            await self.add_to_index(
                embedding_id=embedding_id,
                owner=owner,
                walrus_hash=walrus_hash,
                metadata_vector=vector_array.tolist(),
                category=category,
                ibe_identity=ibe_identity,
                timestamp=timestamp
            )
            
            logger.info(f"Processed embedding event: {embedding_id}")
            
        except Exception as e:
            logger.error(f"Failed to process event: {e}")
    
    async def add_to_index(self, 
                          embedding_id: str,
                          owner: str,
                          walrus_hash: str,
                          metadata_vector: List[float],
                          category: str,
                          ibe_identity: str,
                          timestamp: str):
        """Add a new embedding to the HNSW index."""
        try:
            # Check if already indexed
            if embedding_id in self.embedding_id_to_index:
                logger.warning(f"Embedding {embedding_id} already indexed")
                return
            
            # Prepare vector
            vector_array = np.array(metadata_vector, dtype=np.float32)
            
            # Add to HNSW index
            index_id = self.next_index_id
            self.index.add_items(vector_array.reshape(1, -1), [index_id])
            
            # Store metadata
            embedding_metadata = IndexedEmbedding(
                embedding_id=embedding_id,
                owner=owner,
                walrus_hash=walrus_hash,
                metadata_vector=metadata_vector,
                category=category,
                ibe_identity=ibe_identity,
                timestamp=timestamp
            )
            
            self.metadata_store[index_id] = embedding_metadata
            self.embedding_id_to_index[embedding_id] = index_id
            self.next_index_id += 1
            
            logger.debug(f"Added embedding {embedding_id} to index with ID {index_id}")
            
        except Exception as e:
            logger.error(f"Failed to add embedding to index: {e}")
            raise
    
    async def search(self, 
                    query_vector: np.ndarray, 
                    k: int = 10,
                    category_filter: Optional[str] = None,
                    owner_filter: Optional[str] = None) -> List[Dict]:
        """
        Search the HNSW index for similar embeddings.
        
        Args:
            query_vector: Query vector for similarity search
            k: Number of results to return
            category_filter: Optional category filter
            owner_filter: Optional owner filter
            
        Returns:
            List of search results with metadata
        """
        try:
            # Normalize query vector
            norm = np.linalg.norm(query_vector)
            if norm > 0:
                query_vector = query_vector / norm
            
            # Search HNSW index
            labels, distances = self.index.knn_query(query_vector.reshape(1, -1), k=k*2)  # Get more for filtering
            
            results = []
            for label, distance in zip(labels[0], distances[0]):
                if label in self.metadata_store:
                    metadata = self.metadata_store[label]
                    
                    # Apply filters
                    if category_filter and metadata.category != category_filter:
                        continue
                    if owner_filter and metadata.owner != owner_filter:
                        continue
                    
                    result = {
                        "embedding_id": metadata.embedding_id,
                        "owner": metadata.owner,
                        "walrus_hash": metadata.walrus_hash,
                        "category": metadata.category,
                        "ibe_identity": metadata.ibe_identity,
                        "timestamp": metadata.timestamp,
                        "similarity_score": 1.0 - distance,  # Convert distance to similarity
                        "index_id": label
                    }
                    results.append(result)
                    
                    if len(results) >= k:
                        break
            
            return results
            
        except Exception as e:
            logger.error(f"Search failed: {e}")
            return []
    
    async def backup_index_to_storage(self):
        """Backup the HNSW index to Walrus storage."""
        try:
            # Serialize index and metadata
            index_data = {
                "index_state": self.index.get_items(),
                "metadata_store": {k: v.to_dict() for k, v in self.metadata_store.items()},
                "embedding_id_to_index": self.embedding_id_to_index,
                "next_index_id": self.next_index_id,
                "last_processed_checkpoint": self.last_processed_checkpoint,
                "backup_timestamp": datetime.now().isoformat()
            }
            
            # Save locally first
            backup_path = "data/hnsw_index_backup.pkl"
            os.makedirs(os.path.dirname(backup_path), exist_ok=True)
            
            with open(backup_path, 'wb') as f:
                pickle.dump(index_data, f)
            
            # Upload to Walrus (simulated for now)
            walrus_hash = await self.walrus_client.store_blob(backup_path)
            
            logger.info(f"Backed up index to Walrus: {walrus_hash}")
            
        except Exception as e:
            logger.error(f"Failed to backup index: {e}")
    
    async def load_index_from_storage(self):
        """Load the HNSW index from storage."""
        try:
            backup_path = "data/hnsw_index_backup.pkl"
            
            if os.path.exists(backup_path):
                with open(backup_path, 'rb') as f:
                    index_data = pickle.load(f)
                
                # Restore metadata
                self.metadata_store = {
                    k: IndexedEmbedding(**v) for k, v in index_data["metadata_store"].items()
                }
                self.embedding_id_to_index = index_data["embedding_id_to_index"]
                self.next_index_id = index_data["next_index_id"]
                self.last_processed_checkpoint = index_data.get("last_processed_checkpoint", 0)
                
                # Restore index items if any
                if index_data["index_state"] is not None and len(index_data["index_state"]) > 0:
                    vectors = []
                    labels = []
                    for label, metadata in self.metadata_store.items():
                        vectors.append(metadata.metadata_vector)
                        labels.append(label)
                    
                    if vectors:
                        self.index.add_items(np.array(vectors), labels)
                
                logger.info(f"Loaded index with {len(self.metadata_store)} embeddings")
            else:
                logger.info("No existing index backup found, starting fresh")
                
        except Exception as e:
            logger.error(f"Failed to load index from storage: {e}")
    
    def get_stats(self) -> Dict:
        """Get indexer statistics."""
        return {
            "total_embeddings": len(self.metadata_store),
            "vector_dimension": self.vector_dimension,
            "max_elements": self.max_elements,
            "next_index_id": self.next_index_id,
            "last_processed_checkpoint": self.last_processed_checkpoint,
            "categories": list(set(m.category for m in self.metadata_store.values())),
            "is_running": self.is_running
        }
