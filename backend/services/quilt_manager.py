# Category-based Quilt management for efficient vector storage
import json
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field

from services.walrus_client import WalrusClient, ALRIQuiltBlob as QuiltBlob, QuiltResponse
from services.seal_encryption import SealEncryptionService

logger = logging.getLogger(__name__)

@dataclass
class CategoryQuilt:
    """Represents a category-specific quilt for storing related vector embeddings."""
    category: str
    quilt_id: Optional[str] = None
    blob_count: int = 0
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    last_updated: str = field(default_factory=lambda: datetime.now().isoformat())
    metadata_tags: Dict[str, str] = field(default_factory=dict)
    
    def to_dict(self) -> Dict:
        return {
            "category": self.category,
            "quilt_id": self.quilt_id,
            "blob_count": self.blob_count,
            "created_at": self.created_at,
            "last_updated": self.last_updated,
            "metadata_tags": self.metadata_tags
        }

class QuiltManager:
    """
    Manages category-based quilts for efficient vector embedding storage.
    
    Each category (e.g., 'health', 'finance', 'personal') gets its own quilt,
    making storage more organized and cost-effective.
    """
    
    def __init__(self, walrus_client: Optional[WalrusClient] = None, 
                 seal_service: Optional[SealEncryptionService] = None):
        self.walrus_client = walrus_client or WalrusClient()
        self.seal_service = seal_service or SealEncryptionService()
        
        # Track active quilts by category
        self.category_quilts: Dict[str, CategoryQuilt] = {}
        
        # Configuration
        self.max_blobs_per_quilt = 500  # Prevent quilts from getting too large
        self.quilt_epochs = 200  # Long-term storage for vector embeddings
        
        logger.info("Initialized QuiltManager for category-based storage")
    
    async def get_or_create_category_quilt(self, category: str, user_id: str) -> CategoryQuilt:
        """
        Get existing category quilt or create a new one if needed.
        
        Args:
            category: The category (e.g., 'health', 'finance', 'personal')
            user_id: User identifier for access control
            
        Returns:
            CategoryQuilt object for the specified category
        """
        quilt_key = f"{user_id}:{category}"
        
        if quilt_key in self.category_quilts:
            existing_quilt = self.category_quilts[quilt_key]
            
            # Check if quilt is getting too large, create new one if needed
            if existing_quilt.blob_count >= self.max_blobs_per_quilt:
                logger.info(f"Category quilt {category} full ({existing_quilt.blob_count} blobs), creating new one")
                return await self._create_new_category_quilt(category, user_id)
            
            return existing_quilt
        
        # Create new category quilt
        return await self._create_new_category_quilt(category, user_id)
    
    async def _create_new_category_quilt(self, category: str, user_id: str) -> CategoryQuilt:
        """Create a new category quilt with proper metadata."""
        quilt_key = f"{user_id}:{category}"
        
        # Create quilt metadata tags
        metadata_tags = {
            "type": "vector_embeddings",
            "category": category,
            "user_id": user_id,
            "storage_format": "encrypted_vectors",
            "created_by": "personal_data_wallet",
            "version": "1.0"
        }
        
        category_quilt = CategoryQuilt(
            category=category,
            metadata_tags=metadata_tags
        )
        
        self.category_quilts[quilt_key] = category_quilt
        logger.info(f"Created new category quilt for {category} (user: {user_id})")
        
        return category_quilt
    
    async def store_vector_embedding_to_quilt(self,
                                            embedding_id: str,
                                            category: str,
                                            user_id: str,
                                            main_vector: List[float],
                                            metadata: Dict[str, Any],
                                            ibe_identity: str,
                                            access_policy: Dict[str, Any]) -> Optional[str]:
        """
        Store an encrypted vector embedding to the appropriate category quilt.
        
        Args:
            embedding_id: Unique identifier for the embedding
            category: Category (e.g., 'health', 'personal')
            user_id: User identifier
            main_vector: The main vector to encrypt and store
            metadata: Additional metadata for the embedding
            ibe_identity: Identity for IBE encryption
            access_policy: Access control policy
            
        Returns:
            Quilt ID where the embedding was stored, or None if failed
        """
        try:
            # 1. Get or create category quilt
            category_quilt = await self.get_or_create_category_quilt(category, user_id)
            
            # 2. Encrypt the main vector using Seal IBE
            encrypted_vector_data = None
            if self.seal_service:
                try:
                    encrypted_vector_data = await self.seal_service.encrypt_vector(
                        main_vector, ibe_identity, access_policy
                    )
                except Exception as e:
                    logger.warning(f"Seal encryption failed for {embedding_id}: {e}")
                    # Fallback: store unencrypted (for testing)
                    encrypted_vector_data = json.dumps({
                        "vector": main_vector,
                        "encryption_status": "failed_fallback"
                    }).encode('utf-8')
            else:
                # No encryption service, store as JSON
                encrypted_vector_data = json.dumps({
                    "vector": main_vector,
                    "encryption_status": "unencrypted"
                }).encode('utf-8')
            
            # 3. Create blob for the quilt
            blob_identifier = f"embedding_{embedding_id}"
            
            # Enhanced blob metadata with category information
            blob_metadata = {
                "embedding_id": embedding_id,
                "category": category,
                "user_id": user_id,
                "type": "encrypted_vector",
                "ibe_identity": ibe_identity,
                "created_at": datetime.now().isoformat(),
                **metadata  # Include additional metadata
            }
            
            # 4. If this is the first blob in the quilt, create the quilt
            if category_quilt.quilt_id is None:
                quilt_response = await self._create_quilt_with_blob(
                    category_quilt, blob_identifier, encrypted_vector_data, blob_metadata
                )
                if quilt_response:
                    category_quilt.quilt_id = quilt_response.quilt_id
                    category_quilt.blob_count = 1
                    category_quilt.last_updated = datetime.now().isoformat()
                    logger.info(f"Created new quilt {quilt_response.quilt_id} for category {category}")
                    return quilt_response.quilt_id
            else:
                # 5. Add blob to existing quilt
                success = await self._add_blob_to_existing_quilt(
                    category_quilt, blob_identifier, encrypted_vector_data, blob_metadata
                )
                if success:
                    category_quilt.blob_count += 1
                    category_quilt.last_updated = datetime.now().isoformat()
                    logger.info(f"Added blob to existing quilt {category_quilt.quilt_id}")
                    return category_quilt.quilt_id
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to store vector embedding to quilt: {e}")
            return None
    
    async def _create_quilt_with_blob(self,
                                    category_quilt: CategoryQuilt,
                                    blob_identifier: str,
                                    blob_data: bytes,
                                    blob_metadata: Dict[str, Any]) -> Optional[QuiltResponse]:
        """Create a new quilt with the first blob using enhanced QuiltBlob."""
        try:
            # Check if this is a vector embedding blob
            if blob_metadata.get("type") == "encrypted_vector":
                # Parse the encrypted vector data to extract information
                try:
                    vector_data = json.loads(blob_data.decode('utf-8'))
                    vector = vector_data.get("vector", [])
                    
                    # Create enhanced QuiltBlob for vector embedding
                    quilt_blob = QuiltBlob.create_vector_embedding_blob(
                        identifier=blob_identifier,
                        vector=vector,
                        text=blob_metadata.get("text", "Vector embedding data"),
                        category=blob_metadata.get("category", "unknown"),
                        entities=blob_metadata.get("entities", []) if isinstance(blob_metadata.get("entities"), list) else [],
                        confidence=float(blob_metadata.get("confidence", 1.0)) if blob_metadata.get("confidence") else None,
                        timestamp=blob_metadata.get("created_at"),
                        additional_metadata={
                            "embedding_id": blob_metadata.get("embedding_id", ""),
                            "user_id": blob_metadata.get("user_id", ""),
                            "ibe_identity": blob_metadata.get("ibe_identity", ""),
                            "encryption_status": vector_data.get("encryption_status", "encrypted"),
                            "storage_layer": blob_metadata.get("storage_layer", "external_context"),
                            "similarity_threshold": str(blob_metadata.get("similarity_threshold", 0.8))
                        }
                    )
                except (json.JSONDecodeError, ValueError) as e:
                    logger.warning(f"Could not parse vector data, using raw blob: {e}")
                    # Fallback to basic QuiltBlob
                    quilt_blob = self._create_basic_quilt_blob(blob_identifier, blob_data, blob_metadata)
            else:
                # For non-vector data, use JSON blob creation
                try:
                    # Try to parse as JSON data
                    json_data = json.loads(blob_data.decode('utf-8'))
                    quilt_blob = QuiltBlob.create_json_blob(
                        identifier=blob_identifier,
                        json_data=json_data,
                        content_type="application/json",
                        additional_metadata={
                            k: str(v) for k, v in blob_metadata.items()
                            if not isinstance(v, (dict, list))
                        }
                    )
                except (json.JSONDecodeError, UnicodeDecodeError):
                    # Raw binary data
                    quilt_blob = self._create_basic_quilt_blob(blob_identifier, blob_data, blob_metadata)
            
            # Store quilt with enhanced blob
            quilt_response = await self.walrus_client.store_quilt(
                blobs=[quilt_blob],
                epochs=self.quilt_epochs
            )
            
            return quilt_response
            
        except Exception as e:
            logger.error(f"Failed to create quilt with enhanced blob: {e}")
            return None

    
    def _create_basic_quilt_blob(self, blob_identifier: str, blob_data: bytes, blob_metadata: Dict[str, Any]) -> QuiltBlob:
        """Create a basic QuiltBlob with serialized metadata."""
        # Serialize complex metadata objects to strings for QuiltBlob
        serialized_metadata = {}
        for key, value in blob_metadata.items():
            if isinstance(value, (dict, list)):
                serialized_metadata[key] = json.dumps(value)
            else:
                serialized_metadata[key] = str(value)
        
        return QuiltBlob(
            identifier=blob_identifier,
            data=blob_data,
            metadata=serialized_metadata
        )
    
    async def _add_blob_to_existing_quilt(self,
                                        category_quilt: CategoryQuilt,
                                        blob_identifier: str,
                                        blob_data: bytes,
                                        blob_metadata: Dict[str, Any]) -> bool:
        """
        Add a blob to an existing quilt.
        Note: This is a simplified implementation. In reality, Walrus quilts are immutable,
        so we would need to create a new quilt version or use a different approach.
        
        For now, we'll treat each "addition" as creating a new single-blob quilt
        and track them as part of the same logical category.
        """
        try:
            # Serialize complex metadata for QuiltBlob
            serialized_metadata = {}
            for key, value in blob_metadata.items():
                if isinstance(value, (dict, list)):
                    serialized_metadata[key] = json.dumps(value)
                else:
                    serialized_metadata[key] = str(value)
            
            # Add additional tracking metadata
            serialized_metadata["parent_quilt"] = category_quilt.quilt_id or "none"
            serialized_metadata["quilt_sequence"] = str(category_quilt.blob_count + 1)
            
            # Create a new single-blob quilt (Walrus quilts are immutable)
            quilt_blob = QuiltBlob(
                identifier=blob_identifier,
                data=blob_data,
                metadata=serialized_metadata
            )
            
            # Store as new quilt but track as part of the same category
            quilt_response = await self.walrus_client.store_quilt(
                blobs=[quilt_blob],
                epochs=self.quilt_epochs
            )
            
            if quilt_response:
                logger.info(f"Created additional quilt {quilt_response.quilt_id} for category {category_quilt.category}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Failed to add blob to existing quilt: {e}")
            return False
    
    async def retrieve_vector_from_category_quilt(self,
                                                embedding_id: str,
                                                category: str,
                                                user_id: str,
                                                user_signature: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve and decrypt a vector embedding from a category quilt.
        
        Args:
            embedding_id: The embedding to retrieve
            category: The category quilt to search in
            user_id: User identifier
            user_signature: User signature for access control
            
        Returns:
            Decrypted vector data or None if not found/access denied
        """
        try:
            quilt_key = f"{user_id}:{category}"
            
            if quilt_key not in self.category_quilts:
                logger.warning(f"No quilt found for category {category} and user {user_id}")
                return None
            
            category_quilt = self.category_quilts[quilt_key]
            
            # Try to retrieve from the main quilt
            blob_identifier = f"embedding_{embedding_id}"
            
            if category_quilt.quilt_id:
                encrypted_blob = await self.walrus_client.retrieve_from_quilt_by_id(
                    category_quilt.quilt_id, blob_identifier
                )
                
                if encrypted_blob:
                    # Decrypt the blob using Seal service
                    if self.seal_service:
                        try:
                            # Parse the blob data to get IBE identity
                            blob_str = encrypted_blob.decode('utf-8')
                            
                            # For encrypted data, we need the IBE identity from metadata
                            # This is a simplified approach - in practice, we'd store IBE identity separately
                            ibe_identity = f"owner:{user_id}|category:{category}|embedding:{embedding_id}"
                            
                            decrypted_data = await self.seal_service.decrypt_vector(
                                encrypted_blob,
                                ibe_identity,
                                user_id,
                                user_signature
                            )
                            
                            return {
                                "embedding_id": embedding_id,
                                "category": category,
                                "vector": decrypted_data,
                                "source_quilt": category_quilt.quilt_id,
                                "encryption_status": "decrypted"
                            }
                            
                        except Exception as e:
                            logger.error(f"Failed to decrypt vector {embedding_id}: {e}")
                            # Try to parse as fallback unencrypted data
                            try:
                                blob_data = json.loads(encrypted_blob.decode('utf-8'))
                                return {
                                    "embedding_id": embedding_id,
                                    "category": category,
                                    "vector": blob_data.get("vector"),
                                    "source_quilt": category_quilt.quilt_id,
                                    "encryption_status": blob_data.get("encryption_status", "unknown")
                                }
                            except:
                                pass
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to retrieve vector from category quilt: {e}")
            return None
    
    async def list_category_quilts(self, user_id: str) -> List[Dict[str, Any]]:
        """List all category quilts for a user."""
        user_quilts = []
        
        for quilt_key, category_quilt in self.category_quilts.items():
            if quilt_key.startswith(f"{user_id}:"):
                user_quilts.append(category_quilt.to_dict())
        
        return user_quilts
    
    async def get_quilt_stats(self) -> Dict[str, Any]:
        """Get statistics about all managed quilts."""
        total_quilts = len(self.category_quilts)
        categories = set(quilt.category for quilt in self.category_quilts.values())
        total_blobs = sum(quilt.blob_count for quilt in self.category_quilts.values())
        
        return {
            "total_quilts": total_quilts,
            "unique_categories": len(categories),
            "categories": list(categories),
            "total_blobs": total_blobs,
            "average_blobs_per_quilt": total_blobs / total_quilts if total_quilts > 0 else 0
        }
    
    async def close(self):
        """Clean up resources."""
        if self.walrus_client:
            await self.walrus_client.close()
        if self.seal_service:
            await self.seal_service.close()