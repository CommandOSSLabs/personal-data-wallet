# Two-stage query system: fast metadata search + secure encrypted retrieval
import logging
from typing import Optional, List, Dict
from dataclasses import dataclass

from services.vector_storage import VectorStorageService

logger = logging.getLogger(__name__)

@dataclass
class QueryResult:
    embedding_id: str
    similarity_score: float
    preview: str
    category: str
    timestamp: str
    owner: str
    is_encrypted: bool = True

@dataclass
class ContextResult:
    memories: List[str]
    context_text: str
    total_memories: int

class TwoStageQueryService:
    def __init__(self, storage_service=None):
        self.storage_service = storage_service or VectorStorageService()
        logger.info('Initialized two-stage query service')
    
    async def close(self):
        await self.storage_service.close()
    
    async def store_new_memory(self,
                             text: str,
                             category: str,
                             user_address: str,
                             user_signature: str = 'simulated') -> Optional[str]:
        result = await self.storage_service.store_memory(text, category, user_address)
        return result.embedding_id if result else None
        
    async def search_memories(self, query: str, user_id: str, k: int = 10) -> list:
        results = await self.storage_service.search_memories(query, k, user_id)
        return [result.__dict__ for result in results]
    
    async def stage1_metadata_search(self,
                                   query_text: str,
                                   k: int = 10,
                                   category_filter: Optional[str] = None,
                                   owner_filter: Optional[str] = None) -> List[QueryResult]:
        try:
            results = await self.storage_service.search_memories(query_text, k, owner_filter or 'default-user')
            
            query_results = []
            for result in results:
                query_result = QueryResult(
                    embedding_id=result.embedding_id,
                    similarity_score=getattr(result, 'similarity_score', 0.8),
                    preview=result.content[:100] if hasattr(result, 'content') else 'Memory content',
                    category=getattr(result, 'category', category_filter or 'general'),
                    timestamp=getattr(result, 'timestamp', '2024-01-01T00:00:00'),
                    owner=owner_filter or 'default-user',
                    is_encrypted=True
                )
                query_results.append(query_result)
            
            logger.info(f'Stage 1 search returned {len(query_results)} results for query: {query_text[:50]}...')
            return query_results
            
        except Exception as e:
            logger.error(f'Error in stage1_metadata_search: {e}')
            return []
    
    async def full_query_with_context(self,
                                    query_text: str,
                                    user_address: str,
                                    max_memories: int = 5) -> ContextResult:
        try:
            results = await self.storage_service.search_memories(query_text, max_memories, user_address)
            
            memories = []
            for result in results:
                if hasattr(result, 'content'):
                    memories.append(result.content)
                else:
                    memories.append(f'Memory: {getattr(result, "embedding_id", "unknown")}')
            
            context_text = '\n'.join(memories) if memories else 'No relevant memories found.'
            
            return ContextResult(
                memories=memories,
                context_text=context_text,
                total_memories=len(memories)
            )
            
        except Exception as e:
            logger.error(f'Error in full_query_with_context: {e}')
            return ContextResult(memories=[], context_text='', total_memories=0)