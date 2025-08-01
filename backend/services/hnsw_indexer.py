# HNSW (Hierarchical Navigable Small World) indexer for fast vector similarity search
import logging
import numpy as np
import hnswlib
import pickle
import io
from typing import Dict, List, Optional
from datetime import datetime
from dataclasses import dataclass, asdict

logger = logging.getLogger(__name__)

@dataclass
class IndexedEmbedding:
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
    def __init__(self,
                 vector_dimension: int = 768,
                 max_elements: int = 100000,
                 ef_construction: int = 400,
                 m: int = 32):
        self.vector_dimension = vector_dimension
        self.max_elements = max_elements
        self.ef_construction = ef_construction
        self.m = m
        
        self.index = hnswlib.Index(space='cosine', dim=vector_dimension)
        self.index.init_index(max_elements=max_elements, ef_construction=ef_construction, M=m)
        
        self.metadata_store: Dict[int, IndexedEmbedding] = {}
        self.embedding_id_to_index: Dict[str, int] = {}
        self.next_index_id = 0
        
        logger.info(f'Initialized HNSW indexer with dimension {vector_dimension}')
    
    async def add_embedding(self,
                          embedding_id: str,
                          owner: str,
                          walrus_hash: str,
                          metadata_vector: List[float],
                          category: str,
                          ibe_identity: str,
                          timestamp: str):
        if embedding_id in self.embedding_id_to_index:
            logger.warning(f'Embedding {embedding_id} already indexed')
            return
        
        vector_array = np.array(metadata_vector, dtype=np.float32)
        index_id = self.next_index_id
        self.index.add_items(vector_array.reshape(1, -1), [index_id])
        
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
    
    async def search(self, 
                    query_vector: np.ndarray, 
                    k: int = 10,
                    category_filter: Optional[str] = None,
                    owner_filter: Optional[str] = None) -> List[Dict]:
        if len(self.metadata_store) == 0:
            logger.info('HNSW index is empty')
            return []
        
        if len(self.metadata_store) < k:
            k = len(self.metadata_store)
        
        norm = np.linalg.norm(query_vector)
        if norm > 0:
            query_vector = query_vector / norm
        
        search_k = min(k * 2, len(self.metadata_store))
        labels, distances = self.index.knn_query(query_vector.reshape(1, -1), k=search_k)
        
        results = []
        for label, distance in zip(labels[0], distances[0]):
            if label in self.metadata_store:
                metadata = self.metadata_store[label]
                
                if category_filter and metadata.category != category_filter:
                    continue
                if owner_filter and metadata.owner != owner_filter:
                    continue
                
                result = {
                    'embedding_id': metadata.embedding_id,
                    'owner': metadata.owner,
                    'walrus_hash': metadata.walrus_hash,
                    'category': metadata.category,
                    'ibe_identity': metadata.ibe_identity,
                    'timestamp': metadata.timestamp,
                    'similarity_score': 1.0 - distance,
                    'index_id': label
                }
                results.append(result)
                
                if len(results) >= k:
                    break
        
        return results
    
    def get_stats(self) -> Dict:
        return {
            'total_vectors': len(self.metadata_store),
            'index_size': self.index.get_current_count() if hasattr(self.index, 'get_current_count') else len(self.metadata_store),
            'dimension': self.vector_dimension,
            'max_elements': self.max_elements,
            'ef_construction': self.ef_construction,
            'M': self.m
        }
    
    async def serialize_index(self) -> bytes:
        index_data = {
            'hnsw_index': self.index,
            'metadata_store': dict(self.metadata_store),
            'embedding_id_to_index': dict(self.embedding_id_to_index),
            'next_index_id': self.next_index_id,
            'parameters': {
                'vector_dimension': self.vector_dimension,
                'max_elements': self.max_elements,
                'ef_construction': self.ef_construction,
                'm': self.m
            }
        }
        
        buffer = io.BytesIO()
        pickle.dump(index_data, buffer)
        return buffer.getvalue()
    
    async def load_index(self, serialized_data: bytes):
        buffer = io.BytesIO(serialized_data)
        index_data = pickle.load(buffer)
        
        self.index = index_data['hnsw_index']
        self.metadata_store = index_data['metadata_store']
        self.embedding_id_to_index = index_data['embedding_id_to_index']
        self.next_index_id = index_data['next_index_id']
        
        logger.info(f'Loaded HNSW index with {len(self.metadata_store)} vectors')
    
    async def update_walrus_hash(self, embedding_id: str, walrus_hash: str):
        """Update the Walrus hash for an existing embedding in the metadata store"""
        try:
            if embedding_id in self.embedding_id_to_index:
                index_id = self.embedding_id_to_index[embedding_id]
                if index_id in self.metadata_store:
                    self.metadata_store[index_id].walrus_hash = walrus_hash
                    logger.info(f'Updated Walrus hash for embedding {embedding_id}: {walrus_hash}')
                else:
                    logger.warning(f'Index ID {index_id} not found in metadata store for embedding {embedding_id}')
            else:
                logger.warning(f'Embedding ID {embedding_id} not found in embedding_id_to_index map')
        except Exception as e:
            logger.error(f'Failed to update Walrus hash for {embedding_id}: {e}')