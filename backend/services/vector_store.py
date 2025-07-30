import hnswlib
import numpy as np
import json
import os
from typing import List, Tuple, Optional, Dict, Any
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