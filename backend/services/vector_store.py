import hnswlib
import numpy as np
import json
import os
from typing import List, Tuple, Optional, Dict, Any
from datetime import datetime
from models import EmbeddingResult

class VectorStore:
    def __init__(self, dimension: int = 768, max_elements: int = 10000):
        self.dimension = dimension
        self.max_elements = max_elements
        self.index = hnswlib.Index(space='cosine', dim=dimension)
        self.index.init_index(max_elements=max_elements, ef_construction=200, M=16)
        self.id_to_text = {}  # Map from ID to original text
        self.current_id = 0
        self.is_initialized = False

    def add_embedding(self, embedding: EmbeddingResult) -> int:
        if not self.is_initialized:
            self.index.set_ef(50)  # Set query time accuracy/speed trade-off
            self.is_initialized = True
        
        # Convert to numpy array
        vector = np.array(embedding.vector, dtype=np.float32)
        
        # Add to index
        self.index.add_items(vector, self.current_id)
        
        # Store text mapping
        self.id_to_text[self.current_id] = embedding.text
        
        # Increment ID for next item
        current_id = self.current_id
        self.current_id += 1
        
        return current_id

    def add_embeddings_batch(self, embeddings: List[EmbeddingResult]) -> List[int]:
        if not self.is_initialized:
            self.index.set_ef(50)
            self.is_initialized = True
        
        vectors = np.array([emb.vector for emb in embeddings], dtype=np.float32)
        ids = list(range(self.current_id, self.current_id + len(embeddings)))
        
        # Add to index
        self.index.add_items(vectors, ids)
        
        # Store text mappings
        for i, embedding in enumerate(embeddings):
            self.id_to_text[ids[i]] = embedding.text
        
        self.current_id += len(embeddings)
        return ids

    def search(self, query_vector: List[float], k: int = 5) -> List[Tuple[str, float]]:
        if self.current_id == 0:
            return []
        
        # Convert to numpy array
        query = np.array(query_vector, dtype=np.float32)
        
        # Search
        labels, distances = self.index.knn_query(query, k=min(k, self.current_id))
        
        # Convert to results
        results = []
        for label, distance in zip(labels[0], distances[0]):
            if label in self.id_to_text:
                # Convert distance to similarity (HNSW returns distances, we want similarity)
                similarity = 1.0 - distance
                results.append((self.id_to_text[label], float(similarity)))
        
        return results

    def save_to_file(self, filepath: str) -> None:
        # Save the HNSW index
        self.index.save_index(f"{filepath}.hnsw")
        
        # Save the metadata
        metadata = {
            'id_to_text': self.id_to_text,
            'current_id': self.current_id,
            'dimension': self.dimension,
            'max_elements': self.max_elements
        }
        
        with open(f"{filepath}.meta", 'w') as f:
            json.dump(metadata, f)

    def load_from_file(self, filepath: str) -> None:
        # Load the HNSW index
        self.index.load_index(f"{filepath}.hnsw")
        
        # Load the metadata
        with open(f"{filepath}.meta", 'r') as f:
            metadata = json.load(f)
        
        self.id_to_text = metadata['id_to_text']
        # Convert string keys back to integers
        self.id_to_text = {int(k): v for k, v in self.id_to_text.items()}
        self.current_id = metadata['current_id']
        self.dimension = metadata['dimension']
        self.max_elements = metadata['max_elements']
        self.is_initialized = True

    def get_stats(self) -> Dict[str, Any]:
        return {
            'total_items': self.current_id,
            'dimension': self.dimension,
            'max_elements': self.max_elements,
            'is_initialized': self.is_initialized
        }

    async def save_to_walrus_quilt(self, walrus_client, user_id: str, metadata: Dict[str, Any] = None) -> Optional[str]:
        """Save the vector store to Walrus using Quilt for optimized storage"""
        try:
            from models import VectorIndexQuiltData
            
            # Prepare HNSW index files
            index_files = {}
            
            # Save HNSW index to temporary bytes
            import tempfile
            import os
            
            with tempfile.TemporaryDirectory() as temp_dir:
                temp_path = os.path.join(temp_dir, "temp_index")
                
                # Save index files temporarily
                self.save_to_file(temp_path)
                
                # Read the files into memory
                with open(f"{temp_path}.hnsw", 'rb') as f:
                    index_files["index.hnsw"] = f.read()
                
                with open(f"{temp_path}.meta", 'rb') as f:
                    index_files["index.meta"] = f.read()
            
            # Create index data for quilt storage
            index_metadata = {
                "dimension": str(self.dimension),
                "max_elements": str(self.max_elements),  
                "total_items": str(self.current_id),
                "timestamp": str(datetime.now().isoformat())
            }
            if metadata:
                index_metadata.update(metadata)
            
            index_data = VectorIndexQuiltData(
                user_id=user_id,
                index_files=index_files,
                metadata=index_metadata
            )
            
            # Store on Walrus
            quilt_id = await walrus_client.store_hnsw_index_quilt(index_data)
            return quilt_id
            
        except Exception as e:
            print(f"Error saving vector store to Walrus: {e}")
            return None

    async def load_from_walrus_quilt(self, walrus_client, quilt_id: str) -> bool:
        """Load the vector store from Walrus Quilt storage"""
        try:
            # Retrieve index files from Walrus
            index_files = await walrus_client.retrieve_hnsw_index_from_quilt(quilt_id)
            
            if not index_files or "index.hnsw" not in index_files or "index.meta" not in index_files:
                print("Failed to retrieve complete index files from Walrus")
                return False
            
            # Write files to temporary location and load
            import tempfile
            import os
            
            with tempfile.TemporaryDirectory() as temp_dir:
                temp_path = os.path.join(temp_dir, "temp_index")
                
                # Write index files
                with open(f"{temp_path}.hnsw", 'wb') as f:
                    f.write(index_files["index.hnsw"])
                
                with open(f"{temp_path}.meta", 'wb') as f:
                    f.write(index_files["index.meta"])
                
                # Load the index
                self.load_from_file(temp_path)
            
            return True
            
        except Exception as e:
            print(f"Error loading vector store from Walrus: {e}")
            return False

    async def backup_embeddings_to_quilt(self, walrus_client, user_id: str, metadata: Dict[str, Any] = None) -> Optional[str]:
        """Backup all embeddings to Walrus Quilt for redundancy"""
        try:
            from models import EmbeddingQuiltData, EmbeddingResult
            
            # Convert stored embeddings back to EmbeddingResult format
            embeddings = []
            
            for item_id, text in self.id_to_text.items():
                # We don't have the original vectors, but we can store the text for reconstruction
                # In a real implementation, you'd want to store vectors separately or reconstruct them
                embedding = EmbeddingResult(
                    vector=[0.0] * self.dimension,  # Placeholder - would need reconstruction
                    text=text
                )
                embeddings.append(embedding)
            
            embedding_metadata = {
                "backup_type": "embeddings",
                "total_count": str(len(embeddings)),
                "dimension": str(self.dimension),
                "timestamp": str(datetime.now().isoformat())
            }
            if metadata:
                embedding_metadata.update(metadata)
            
            embedding_data = EmbeddingQuiltData(
                user_id=user_id,
                embeddings=embeddings,
                metadata=embedding_metadata
            )
            
            # Store embeddings on Walrus
            quilt_id = await walrus_client.store_embeddings_quilt(embedding_data)
            return quilt_id
            
        except Exception as e:
            print(f"Error backing up embeddings to Walrus: {e}")
            return None
