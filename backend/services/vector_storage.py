# Two-stage vector storage system: fast metadata search + secure encrypted retrieval
import hashlib
import logging
from datetime import datetime
from typing import Optional
from dataclasses import dataclass

from services.google_embeddings import GoogleEmbeddingService
from services.hnsw_indexer import HNSWIndexerService
from services.walrus_client import WalrusClient, EncryptedEmbedding, HNSWIndex
from services.sui_client import SuiClient

logger = logging.getLogger(__name__)

@dataclass
class StorageResult:
    embedding_id: str
    walrus_hash: str
    success: bool
    error: Optional[str] = None

@dataclass
class QueryResult:
    embedding_id: str
    owner: str
    category: str
    similarity_score: float
    walrus_hash: str
    ibe_identity: str

class VectorStorageService:
    def __init__(self):
        self.embedding_service = GoogleEmbeddingService()
        self.indexer_service = HNSWIndexerService()
        self.walrus_client = WalrusClient()
        self.sui_client = SuiClient()
        
        logger.info('Initialized vector storage service')
    
    async def store_memory(self,
                          text: str,
                          category: str,
                          user_address: str) -> Optional[StorageResult]:
        try:
            logger.info(f'Storing memory: {text[:50]}... (category: {category})')
            
            # Use the available method from GoogleEmbeddingService
            content_vector = self.embedding_service._get_embedding(text)
            metadata_vector = self.embedding_service._get_embedding(f'{category}: {text[:100]}')
            
            timestamp = datetime.now()
            ibe_identity = f'embedding_{user_address}_{category}_{int(timestamp.timestamp())}'
            
            # Ensure content_vector is a list
            if hasattr(content_vector, 'tolist'):
                content_vector_list = content_vector.tolist()
            else:
                content_vector_list = list(content_vector)
                
            embedding = EncryptedEmbedding(
                vector=content_vector_list,
                metadata={
                    'text_preview': text[:100],
                    'category': category,
                    'dimension': str(len(content_vector_list))
                },
                owner=user_address,
                ibe_identity=ibe_identity,
                created_at=timestamp.isoformat(),
                checksum=hashlib.sha256(str(content_vector_list).encode()).hexdigest()
            )
            
            walrus_hash = await self.walrus_client.store_encrypted_embedding(embedding)
            
            # Ensure metadata_vector is a list
            if hasattr(metadata_vector, 'tolist'):
                metadata_vector_list = metadata_vector.tolist()
            else:
                metadata_vector_list = list(metadata_vector)
                
            embedding_id = await self.sui_client.add_embedding(
                walrus_hash=walrus_hash,
                metadata_vector=metadata_vector_list,
                category=category,
                ibe_identity=ibe_identity,
                policy_hash=f'policy_{user_address}_{int(timestamp.timestamp())}',
                user_address=user_address,
                user_signature='simulated_signature'
            )
            
            await self.indexer_service.add_embedding(
                embedding_id=embedding_id,
                owner=user_address,
                walrus_hash=walrus_hash,
                metadata_vector=metadata_vector_list,
                category=category,
                ibe_identity=ibe_identity,
                timestamp=timestamp.isoformat()
            )
            
            await self._persist_index_if_needed(user_address)
            
            logger.info(f'Stored memory: {embedding_id}')
            return StorageResult(embedding_id, walrus_hash, True)
            
        except Exception as e:
            logger.error(f'Failed to store memory: {e}', exc_info=True)
            return StorageResult("", "", False, str(e))
    
    async def search_memories(self,
                            query: str,
                            k: int = 10,
                            user_filter: Optional[str] = None) -> list[QueryResult]:
        try:
            if len(self.indexer_service.metadata_store) == 0:
                return []
            
            query_vector = self.embedding_service.encode_query(query)
            search_results = await self.indexer_service.search(
                query_vector=query_vector,
                k=k,
                owner_filter=user_filter
            )
            
            results = []
            for result in search_results:
                results.append(QueryResult(
                    embedding_id=result['embedding_id'],
                    owner=result['owner'],
                    category=result['category'],
                    similarity_score=result['similarity_score'],
                    walrus_hash=result['walrus_hash'],
                    ibe_identity=result['ibe_identity']
                ))
            
            return results
            
        except Exception as e:
            logger.error(f'Search failed: {e}')
            return []
    
    async def _persist_index_if_needed(self, user_address: str):
        stats = self.indexer_service.get_stats()
        total_vectors = stats.get('total_vectors', 0)
        
        if total_vectors > 0 and total_vectors % 10 == 0:
            index_data = await self.indexer_service.serialize_index()
            
            index = HNSWIndex(
                algorithm='HNSW',
                dimension=768,
                total_vectors=total_vectors,
                ef_construction=self.indexer_service.ef_construction,
                M=self.indexer_service.m,
                serialized_data=index_data.hex(),
                owner=user_address,
                created_at=datetime.now().isoformat()
            )
            
            await self.walrus_client.store_hnsw_index(index)
            logger.info(f'Persisted HNSW index with {total_vectors} vectors')
    
    async def close(self):
        await self.walrus_client.close()
        await self.sui_client.close()