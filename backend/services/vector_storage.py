# Two-stage vector storage system: fast metadata search + secure encrypted retrieval
import hashlib
import logging
import time
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
            
            # STEP 1: Categorize (already done via input parameter)
            logger.info(f'Step 1: Memory categorized as: {category}')
            
            # STEP 2: Embed to vector
            logger.info('Step 2: Creating embeddings...')
            content_vector = self.embedding_service._get_embedding(text)
            metadata_vector = self.embedding_service._get_embedding(f'{category}: {text[:100]}')
            
            timestamp = datetime.now()
            ibe_identity = f'embedding_{user_address}_{category}_{int(timestamp.timestamp())}'
            
            # Ensure vectors are lists
            if hasattr(content_vector, 'tolist'):
                content_vector_list = content_vector.tolist()
            else:
                content_vector_list = list(content_vector)
                
            if hasattr(metadata_vector, 'tolist'):
                metadata_vector_list = metadata_vector.tolist()
            else:
                metadata_vector_list = list(metadata_vector)
            
            # STEP 3: Add to indexer
            logger.info('Step 3: Adding to indexer...')
            embedding_id = f'embedding_{user_address}_{category}_{int(timestamp.timestamp() * 1000)}'
            
            await self.indexer_service.add_embedding(
                embedding_id=embedding_id,
                owner=user_address,
                walrus_hash="pending",  # Will be updated after Walrus storage
                metadata_vector=metadata_vector_list,
                category=category,
                ibe_identity=ibe_identity,
                timestamp=timestamp.isoformat()
            )
            
            # STEP 4: Build HNSW index
            logger.info('Step 4: Building HNSW index...')
            await self._persist_index_if_needed(user_address)
            
            # STEP 5: Insert into Walrus
            logger.info('Step 5: Storing on Walrus...')
            embedding = EncryptedEmbedding(
                vector=content_vector_list,
                metadata={
                    'text_preview': text[:100],
                    'category': category,
                    'dimension': str(len(content_vector_list)),
                    'embedding_id': embedding_id
                },
                owner=user_address,
                ibe_identity=ibe_identity,
                created_at=timestamp.isoformat(),
                checksum=hashlib.sha256(str(content_vector_list).encode()).hexdigest(),
                full_text_content=text  # Store the complete original text
            )
            
            walrus_hash = await self.walrus_client.store_encrypted_embedding(embedding)
            
            # Update the indexer with the actual Walrus hash
            await self.indexer_service.update_walrus_hash(embedding_id, walrus_hash)
            
            # STEP 6: Register on Sui blockchain (metadata registration)
            logger.info('Step 6: Registering on Sui blockchain...')
            sui_embedding_id = await self.sui_client.add_embedding(
                walrus_hash=walrus_hash,
                metadata_vector=metadata_vector_list,
                category=category,
                ibe_identity=ibe_identity,
                policy_hash=f'policy_{user_address}_{int(timestamp.timestamp())}',
                user_address=user_address,
                user_signature='simulated_signature'
            )
            
            logger.info(f'Memory storage complete: {embedding_id} -> {walrus_hash}')
            return StorageResult(embedding_id, walrus_hash, True)
            
        except Exception as e:
            logger.error(f'Failed to store memory: {e}', exc_info=True)
            return StorageResult("", "", False, str(e))
    
    async def search_memories(self,
                            query: str,
                            k: int = 10,
                            user_filter: Optional[str] = None) -> list[QueryResult]:
        try:
            # Quick check if the index is empty
            if not self.indexer_service.metadata_store:
                logger.info('Search skipped: metadata store is empty')
                return []
            
            # Limit k to a reasonable number
            k = min(k, 50)
            
            # Only generate embeddings if we have a query
            if query.strip():
                start_time = time.time()
                query_vector = self.embedding_service.encode_query(query)
                encoding_time = time.time() - start_time
                logger.info(f'Query encoding completed in {encoding_time:.2f}s')
                
                start_time = time.time()
                search_results = await self.indexer_service.search(
                    query_vector=query_vector,
                    k=k,
                    owner_filter=user_filter
                )
                search_time = time.time() - start_time
                logger.info(f'Vector search completed in {search_time:.2f}s for query: "{query[:30]}..." with {len(search_results)} results')
            else:
                # If query is empty, just get the most recent entries without vector search
                logger.info('Empty query, returning most recent entries')
                metadata_items = list(self.indexer_service.metadata_store.items())
                
                # Filter by owner if needed
                if user_filter:
                    metadata_items = [(idx, meta) for idx, meta in metadata_items 
                                     if meta.owner == user_filter]
                                     
                # Sort by timestamp (most recent first) and take top k
                metadata_items.sort(key=lambda x: x[1].timestamp if hasattr(x[1], 'timestamp') else '', reverse=True)
                metadata_items = metadata_items[:k]
                
                # Convert to same format as search results
                search_results = [{
                    'embedding_id': meta.embedding_id,
                    'owner': meta.owner,
                    'category': meta.category,
                    'similarity_score': 1.0,  # Default score for non-query results
                    'walrus_hash': meta.walrus_hash,
                    'ibe_identity': meta.ibe_identity
                } for _, meta in metadata_items]
            
            # Convert search results to QueryResults
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
            logger.error(f'Search failed: {e}', exc_info=True)
            return []
    
    async def get_memory_content(self, walrus_hash: str) -> Optional[str]:
        """Retrieve and decrypt the full content of a memory from Walrus"""
        try:
            logger.info(f'Retrieving content from Walrus: {walrus_hash}')
            
            # Get the encrypted embedding from Walrus
            encrypted_embedding = await self.walrus_client.get_encrypted_embedding(walrus_hash)
            
            if encrypted_embedding and hasattr(encrypted_embedding, 'full_text_content'):
                # In production, this would be properly decrypted using IBE
                # For now, return the stored content (assuming it's accessible)
                return encrypted_embedding.full_text_content
            else:
                logger.warning(f'No content found for Walrus hash: {walrus_hash}')
                return None
                
        except Exception as e:
            logger.error(f'Failed to retrieve content from Walrus: {e}')
            return None
    
    async def search_memories_with_content(self,
                                         query: str,
                                         k: int = 10,
                                         user_filter: Optional[str] = None,
                                         include_content: bool = False) -> list:
        """Search memories and optionally include full decrypted content"""
        try:
            # Get basic search results
            search_results = await self.search_memories(query, k, user_filter)
            
            if not include_content:
                return search_results
            
            # Enhance results with full content
            enhanced_results = []
            for result in search_results:
                enhanced_result = {
                    'embedding_id': result.embedding_id,
                    'owner': result.owner,
                    'category': result.category,
                    'similarity_score': result.similarity_score,
                    'walrus_hash': result.walrus_hash,
                    'ibe_identity': result.ibe_identity,
                    'full_content': None
                }
                
                # Try to retrieve full content
                if result.walrus_hash and result.walrus_hash != "pending":
                    content = await self.get_memory_content(result.walrus_hash)
                    enhanced_result['full_content'] = content
                
                enhanced_results.append(enhanced_result)
            
            return enhanced_results
            
        except Exception as e:
            logger.error(f'Enhanced search failed: {e}')
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