import asyncio
import json
import numpy as np
from typing import Dict, List, Optional, Tuple, Any
import logging
from dataclasses import dataclass
from datetime import datetime

from services.google_embeddings import GoogleEmbeddingService
from services.hnsw_indexer import HNSWIndexerService
from services.seal_encryption import SealEncryptionService
from services.walrus_client import WalrusClient
from services.sui_client import SuiClient

logger = logging.getLogger(__name__)

@dataclass
class QueryResult:
    """Represents a query result with metadata and optional decrypted content."""
    embedding_id: str
    owner: str
    category: str
    similarity_score: float
    timestamp: str
    preview: str
    walrus_hash: Optional[str] = None
    ibe_identity: Optional[str] = None
    decrypted_content: Optional[str] = None
    access_granted: bool = False

class TwoStageQueryService:
    """
    Implements the two-stage query system:
    Stage 1: Fast metadata search using HNSW index
    Stage 2: Secure retrieval and decryption using Seal
    """
    
    def __init__(self):
        self.embedding_service = GoogleEmbeddingService()
        self.indexer_service = HNSWIndexerService()
        self.seal_service = SealEncryptionService()
        self.walrus_client = WalrusClient()
        self.sui_client = SuiClient()
        
        logger.info("Initialized two-stage query service")
    
    async def start(self):
        """Start the query service."""
        # Start the indexer service
        await self.indexer_service.start()
        logger.info("Two-stage query service started")
    
    async def stop(self):
        """Stop the query service."""
        await self.indexer_service.stop()
        await self.seal_service.close()
        await self.walrus_client.close()
        await self.sui_client.close()
        logger.info("Two-stage query service stopped")
    
    async def stage1_metadata_search(self, 
                                   query_text: str,
                                   k: int = 10,
                                   category_filter: Optional[str] = None,
                                   owner_filter: Optional[str] = None) -> List[QueryResult]:
        """
        Stage 1: Fast metadata search using HNSW index.
        
        Args:
            query_text: The search query
            k: Number of results to return
            category_filter: Optional category filter
            owner_filter: Optional owner filter
            
        Returns:
            List of query results with metadata only
        """
        try:
            # Convert query to vector
            query_vector = self.embedding_service.encode_query(query_text)
            
            # Search HNSW index
            search_results = await self.indexer_service.search(
                query_vector=query_vector,
                k=k,
                category_filter=category_filter,
                owner_filter=owner_filter
            )
            
            # Convert to QueryResult objects
            results = []
            for result in search_results:
                query_result = QueryResult(
                    embedding_id=result["embedding_id"],
                    owner=result["owner"],
                    category=result["category"],
                    similarity_score=result["similarity_score"],
                    timestamp=result["timestamp"],
                    preview=f"Category: {result['category']} | Score: {result['similarity_score']:.3f}",
                    walrus_hash=result["walrus_hash"],
                    ibe_identity=result["ibe_identity"]
                )
                results.append(query_result)
            
            logger.info(f"Stage 1 search returned {len(results)} results for query: {query_text[:50]}...")
            return results
            
        except Exception as e:
            logger.error(f"Stage 1 search failed: {e}")
            return []
    
    async def stage2_secure_retrieval(self, 
                                    embedding_id: str,
                                    user_address: str,
                                    user_signature: str) -> Optional[QueryResult]:
        """
        Stage 2: Secure retrieval and decryption of selected embedding.
        
        Args:
            embedding_id: ID of the embedding to retrieve
            user_address: Address of the requesting user
            user_signature: User's signature for authentication
            
        Returns:
            QueryResult with decrypted content if access granted
        """
        try:
            # Step 1: Get object data from Sui blockchain
            sui_object = await self.sui_client.get_object(embedding_id)
            if not sui_object:
                logger.warning(f"Object not found: {embedding_id}")
                return None
            
            # Extract object data
            walrus_hash = sui_object.get("walrus_hash")
            ibe_identity = sui_object.get("ibe_identity")
            owner = sui_object.get("owner")
            category = sui_object.get("category")
            
            # Step 2: Check access permissions
            if not await self._check_access_permissions(user_address, owner, category):
                logger.warning(f"Access denied for user {user_address} to object {embedding_id}")
                return QueryResult(
                    embedding_id=embedding_id,
                    owner=owner,
                    category=category,
                    similarity_score=0.0,
                    timestamp=datetime.now().isoformat(),
                    preview="Access denied",
                    access_granted=False
                )
            
            # Step 3: Create PTB for seal_approve function
            ptb = await self._create_access_ptb(embedding_id, user_address)
            
            # Step 4: Request decryption key from Seal servers
            key_response = await self.seal_service.request_decryption_key(
                ibe_identity=ibe_identity,
                sui_ptb=ptb,
                user_signature=user_signature
            )
            
            if not key_response:
                logger.error(f"Failed to get decryption key for {embedding_id}")
                return None
            
            # Step 5: Fetch encrypted data from Walrus
            encrypted_data = await self.walrus_client.retrieve_blob(walrus_hash)
            if not encrypted_data:
                logger.error(f"Failed to fetch data from Walrus: {walrus_hash}")
                return None
            
            # Step 6: Decrypt the data
            decrypted_bytes = await self.seal_service.decrypt_data(
                encrypted_data=encrypted_data,
                decryption_key=key_response["decryption_key"],
                ibe_identity=ibe_identity
            )
            
            # Step 7: Parse decrypted content
            decrypted_content = json.loads(decrypted_bytes.decode('utf-8'))
            
            # Step 8: Mark as accessed on-chain
            await self.sui_client.mark_embedding_accessed(embedding_id, user_address)
            
            result = QueryResult(
                embedding_id=embedding_id,
                owner=owner,
                category=category,
                similarity_score=1.0,  # Full match since specifically requested
                timestamp=datetime.now().isoformat(),
                preview=f"Successfully retrieved {category} content",
                walrus_hash=walrus_hash,
                ibe_identity=ibe_identity,
                decrypted_content=str(decrypted_content),
                access_granted=True
            )
            
            logger.info(f"Stage 2 retrieval successful for {embedding_id}")
            return result
            
        except Exception as e:
            logger.error(f"Stage 2 retrieval failed: {e}")
            return None
    
    async def full_query_with_context(self, 
                                    query_text: str,
                                    user_address: str,
                                    user_signature: str,
                                    k: int = 5,
                                    category_filter: Optional[str] = None) -> Dict[str, Any]:
        """
        Perform full query with context retrieval for LLM integration.
        
        Args:
            query_text: The search query
            user_address: Address of the requesting user
            user_signature: User's signature for authentication
            k: Number of results to retrieve
            category_filter: Optional category filter
            
        Returns:
            Dictionary containing search results and context for LLM
        """
        try:
            # Stage 1: Fast metadata search
            metadata_results = await self.stage1_metadata_search(
                query_text=query_text,
                k=k,
                category_filter=category_filter,
                owner_filter=user_address  # Only search user's own memories
            )
            
            # Stage 2: Retrieve top results with decryption
            context_items = []
            for result in metadata_results[:k]:  # Limit to top k results
                if result.similarity_score > 0.3:  # Only retrieve if similarity is high enough
                    decrypted_result = await self.stage2_secure_retrieval(
                        embedding_id=result.embedding_id,
                        user_address=user_address,
                        user_signature=user_signature
                    )
                    
                    if decrypted_result and decrypted_result.access_granted:
                        context_items.append({
                            "content": decrypted_result.decrypted_content,
                            "category": decrypted_result.category,
                            "similarity": decrypted_result.similarity_score,
                            "timestamp": decrypted_result.timestamp
                        })
            
            # Prepare context for LLM
            context_text = ""
            if context_items:
                context_text = "Relevant memories from your personal data:\n\n"
                for i, item in enumerate(context_items, 1):
                    context_text += f"{i}. [{item['category']}] {item['content']}\n"
                context_text += "\n"
            
            return {
                "query": query_text,
                "context": context_text,
                "context_items": context_items,
                "total_results": len(metadata_results),
                "retrieved_results": len(context_items),
                "search_timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Full query failed: {e}")
            return {
                "query": query_text,
                "context": "",
                "context_items": [],
                "total_results": 0,
                "retrieved_results": 0,
                "error": str(e)
            }
    
    async def _check_access_permissions(self, 
                                      user_address: str, 
                                      owner_address: str, 
                                      category: str) -> bool:
        """Check if user has access to the embedding."""
        # Basic access control: user can only access their own data
        # In production, this could be more sophisticated
        return user_address.lower() == owner_address.lower()
    
    async def _create_access_ptb(self, embedding_id: str, user_address: str) -> Dict:
        """Create Programmable Transaction Block for access verification."""
        # This would create an actual PTB for Sui
        # For now, return a simulated PTB
        return {
            "transaction_type": "seal_approve",
            "embedding_id": embedding_id,
            "user_address": user_address,
            "timestamp": datetime.now().isoformat(),
            "function_call": {
                "package": "vector_index",
                "module": "vector_index",
                "function": "mark_accessed",
                "arguments": [embedding_id]
            }
        }
    
    async def store_new_memory(self, 
                             text: str,
                             category: str,
                             user_address: str,
                             user_signature: str,
                             additional_metadata: Optional[Dict] = None) -> Optional[str]:
        """
        Store a new memory following the complete flow.
        
        Args:
            text: The text content to store
            category: Category for the memory
            user_address: User's Sui address
            user_signature: User's signature
            additional_metadata: Additional metadata
            
        Returns:
            Embedding ID if successful, None otherwise
        """
        try:
            # Step 1: Generate embeddings
            encoded_data = self.embedding_service.encode_for_storage(
                text=text,
                category=category,
                user_id=user_address,
                additional_metadata=additional_metadata
            )
            
            # Step 2: Prepare for encryption
            main_vector_bytes, metadata_for_chain = self.embedding_service.prepare_for_encryption(encoded_data)
            
            # Step 3: Create access policy
            policy = self.seal_service.generate_access_policy(
                user_address=user_address,
                category=category
            )
            
            # Step 4: Encrypt main vector
            encryption_result = await self.seal_service.encrypt_data(
                data=main_vector_bytes,
                policy=policy
            )
            
            # Step 5: Store encrypted data on Walrus
            walrus_hash = await self.walrus_client.store_blob({
                "type": "encrypted_memory",
                "data": encryption_result["encrypted_data"]
            })
            
            # Step 6: Register on Sui blockchain
            embedding_id = await self.sui_client.add_embedding(
                walrus_hash=walrus_hash,
                metadata_vector=metadata_for_chain["metadata_vector"],
                category=category,
                ibe_identity=encryption_result["ibe_identity"],
                policy_hash=policy["policy_hash"],
                user_address=user_address,
                user_signature=user_signature
            )
            
            logger.info(f"Successfully stored new memory: {embedding_id}")
            return embedding_id
            
        except Exception as e:
            logger.error(f"Failed to store new memory: {e}")
            return None
    
    def get_service_stats(self) -> Dict:
        """Get service statistics."""
        indexer_stats = self.indexer_service.get_stats()
        return {
            "indexer": indexer_stats,
            "embedding_service": self.embedding_service.get_model_info(),
            "seal_service": self.seal_service.get_service_info()
        }
