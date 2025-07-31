import asyncio
import json
import logging
import numpy as np
import hnswlib
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime
import pickle
import os
from dataclasses import dataclass, asdict, field
import datetime
from services.walrus_client import WalrusClient
from services.sui_client import SuiClient
from services.seal_encryption import SealEncryptionService
from config import settings

logger = logging.getLogger(__name__)

@dataclass
class IndexedEmbedding:
    """Represents an indexed embedding with enhanced metadata and privacy features."""
    embedding_id: str
    owner: str
    walrus_hash: str  # Encrypted main vector blob hash
    metadata_vector: List[float]  # Public searchable metadata vector
    category: str
    ibe_identity: str
    timestamp: str
    
    # Enhanced metadata following our architecture
    entities: Dict[str, dict] = field(default_factory=dict)  # EntityInfo dicts
    relationships: List[dict] = field(default_factory=list)  # RelationshipTriplet dicts
    temporal_data: Dict[str, str] = field(default_factory=dict)
    storage_layer: str = "external_context"  # main_context or external_context
    similarity_threshold: float = 0.8
    
    # Privacy layer additions
    main_vector_encrypted: bool = True  # Whether main vector is encrypted with Seal
    encryption_policy: Dict[str, str] = field(default_factory=dict)  # Access policy info
    
    def to_dict(self):
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
    
    # Enhanced metadata storage (unified indexer approach)
    self.metadata_store: Dict[int, IndexedEmbedding] = {}
    self.embedding_id_to_index: Dict[str, int] = {}
    self.next_index_id = 0
    
    # Services
    self.sui_client = SuiClient()
    self.walrus_client = WalrusClient()
    self.seal_service = SealEncryptionService()  # Privacy layer
    
    # Configuration
    self.index_backup_interval = getattr(settings, 'index_backup_interval', 3600)  # 1 hour
    self.sui_event_poll_interval = getattr(settings, 'sui_event_poll_interval', 5)  # 5 seconds
    
    # State
    self.is_running = False
    self.last_processed_checkpoint = 0
    
    # Unified indexer settings
    self.default_similarity_threshold = 0.8
    self.main_context_max_items = 1000  # Items to keep in main context
    
    logger.info(f"Initialized Enhanced HNSW indexer with dimension {vector_dimension}")
    
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
        await self.seal_service.close()
    
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

    async def add_enhanced_embedding_with_privacy(self,
                                                embedding_id: str,
                                                owner: str,
                                                main_vector: List[float],  # Full vector to be encrypted
                                                metadata_vector: List[float],  # Searchable metadata vector
                                                category: str,
                                                timestamp: str,
                                                entities: Dict[str, dict] = None,
                                                relationships: List[dict] = None,
                                                temporal_data: Dict[str, str] = None,
                                                storage_layer: str = "external_context",
                                                additional_policies: List[str] = None) -> int:
        """
        Add embedding with privacy-preserving two-layer approach:
        - Metadata vector: Public, searchable in HNSW index
        - Main vector: Encrypted with Seal IBE, stored on Walrus
        """
        try:
            # Check if already indexed
            if embedding_id in self.embedding_id_to_index:
                logger.warning(f"Embedding {embedding_id} already indexed")
                return self.embedding_id_to_index[embedding_id]
            
            # Step 1: Create access policy for Seal encryption
            policy = self.seal_service.generate_access_policy(
                user_address=owner,
                category=category,
                additional_policies=additional_policies
            )
            
            # Step 2: Encrypt main vector with Seal IBE
            main_vector_bytes = json.dumps({
                "main_vector": main_vector,
                "embedding_id": embedding_id,
                "owner": owner,
                "category": category,
                "entities": entities or {},
                "relationships": relationships or [],
                "temporal_data": temporal_data or {},
                "timestamp": timestamp
            }).encode('utf-8')
            
            encryption_result = await self.seal_service.encrypt_data(
                data=main_vector_bytes,
                policy=policy,
                object_id=embedding_id
            )
            
            # Step 3: Store encrypted main vector on Walrus
            walrus_hash = await self.walrus_client.store_blob(
                data=encryption_result["encrypted_data"].encode('utf-8'),
                epochs=200 if storage_layer == "external_context" else 50,
                deletable=False  # Important data, not deletable
            )
            
            if not walrus_hash:
                raise Exception("Failed to store encrypted vector on Walrus")
            
            # Step 4: Add metadata vector to HNSW index (public, searchable)
            metadata_array = np.array(metadata_vector, dtype=np.float32)
            
            # Normalize for cosine similarity
            norm = np.linalg.norm(metadata_array)
            if norm > 0:
                metadata_array = metadata_array / norm
            
            index_id = self.next_index_id
            self.index.add_items(metadata_array.reshape(1, -1), [index_id])
            
            # Step 5: Store enhanced metadata with privacy info
            embedding_metadata = IndexedEmbedding(
                embedding_id=embedding_id,
                owner=owner,
                walrus_hash=walrus_hash,  # Points to encrypted main vector
                metadata_vector=metadata_vector,  # Public searchable vector
                category=category,
                ibe_identity=encryption_result["ibe_identity"],
                timestamp=timestamp,
                entities=entities or {},
                relationships=relationships or [],
                temporal_data=temporal_data or {},
                storage_layer=storage_layer,
                similarity_threshold=self.default_similarity_threshold,
                main_vector_encrypted=True,
                encryption_policy={
                    "policy_hash": policy["policy_hash"],
                    "access_rules": ",".join(policy["access_rules"]),
                    "category": category
                }
            )
            
            self.metadata_store[index_id] = embedding_metadata
            self.embedding_id_to_index[embedding_id] = index_id
            self.next_index_id += 1
            
            logger.info(f"Added privacy-preserving embedding {embedding_id} to unified index with ID {index_id}")
            logger.debug(f"Main vector encrypted with IBE identity: {encryption_result['ibe_identity']}")
            logger.debug(f"Metadata vector ({len(metadata_vector)} dims) stored in HNSW index")
            
            # Auto-backup to Walrus if needed
            await self._check_auto_backup()
            
            return index_id
            
        except Exception as e:
            logger.error(f"Failed to add privacy-preserving embedding to index: {e}")
            raise

    async def retrieve_decrypted_main_vector(self, 
                                           embedding_id: str,
                                           user_address: str,
                                           user_signature: str) -> Optional[Dict]:
        """
        Retrieve and decrypt the main vector for a given embedding.
        This is used when full vector data is needed (not just metadata search).
        """
        try:
            # Get embedding metadata from index
            if embedding_id not in self.embedding_id_to_index:
                logger.warning(f"Embedding {embedding_id} not found in index")
                return None
            
            index_id = self.embedding_id_to_index[embedding_id]
            metadata = self.metadata_store[index_id]
            
            # Check if user has access (basic ownership check)
            if metadata.owner.lower() != user_address.lower():
                logger.warning(f"Access denied: {user_address} cannot access {embedding_id} owned by {metadata.owner}")
                return None
            
            # For encrypted vectors, we need to decrypt via Seal
            if metadata.main_vector_encrypted:
                # Step 1: Create access PTB (simplified for development)
                ptb = {
                    "transaction_type": "access_request",
                    "embedding_id": embedding_id,
                    "user_address": user_address,
                    "timestamp": datetime.datetime.now().isoformat()
                }
                
                # Step 2: Request decryption key from Seal servers
                key_response = await self.seal_service.request_decryption_key(
                    ibe_identity=metadata.ibe_identity,
                    sui_ptb=ptb,
                    user_signature=user_signature
                )
                
                # Step 3: Retrieve encrypted data from Walrus
                encrypted_data = await self.walrus_client.retrieve_blob(metadata.walrus_hash)
                if not encrypted_data:
                    logger.error(f"Failed to retrieve encrypted data from Walrus: {metadata.walrus_hash}")
                    return None
                
                # Step 4: Decrypt the main vector
                decrypted_bytes = await self.seal_service.decrypt_data(
                    encrypted_data=encrypted_data.decode('utf-8'),
                    decryption_key=key_response["decryption_key"],
                    ibe_identity=metadata.ibe_identity
                )
                
                # Step 5: Parse decrypted content
                decrypted_content = json.loads(decrypted_bytes.decode('utf-8'))
                
                logger.info(f"Successfully decrypted main vector for {embedding_id}")
                return {
                    "embedding_id": embedding_id,
                    "main_vector": decrypted_content["main_vector"],
                    "metadata_vector": metadata.metadata_vector,
                    "owner": metadata.owner,
                    "category": metadata.category,
                    "entities": decrypted_content.get("entities", {}),
                    "relationships": decrypted_content.get("relationships", []),
                    "temporal_data": decrypted_content.get("temporal_data", {}),
                    "timestamp": metadata.timestamp,
                    "decrypted": True
                }
            else:
                # For non-encrypted vectors (legacy or development)
                logger.warning(f"Embedding {embedding_id} is not encrypted")
                return {
                    "embedding_id": embedding_id,
                    "main_vector": metadata.metadata_vector,  # Fallback to metadata vector
                    "metadata_vector": metadata.metadata_vector,
                    "owner": metadata.owner,
                    "category": metadata.category,
                    "entities": metadata.entities,
                    "relationships": metadata.relationships,
                    "temporal_data": metadata.temporal_data,
                    "timestamp": metadata.timestamp,
                    "decrypted": False
                }
                
        except Exception as e:
            logger.error(f"Failed to retrieve decrypted main vector for {embedding_id}: {e}")
            return None

    async def add_enhanced_embedding(self,
                                   embedding_id: str,
                                   owner: str,
                                   walrus_hash: str,
                                   metadata_vector: List[float],
                                   category: str,
                                   ibe_identity: str,
                                   timestamp: str,
                                   entities: Dict[str, dict] = None,
                                   relationships: List[dict] = None,
                                   temporal_data: Dict[str, str] = None,
                                   storage_layer: str = "external_context") -> int:
        """
        Legacy method for backward compatibility.
        For new implementations, use add_enhanced_embedding_with_privacy instead.
        """
        try:
            # Check if already indexed
            if embedding_id in self.embedding_id_to_index:
                logger.warning(f"Embedding {embedding_id} already indexed")
                return self.embedding_id_to_index[embedding_id]
            
            # Prepare vector
            vector_array = np.array(metadata_vector, dtype=np.float32)
            
            # Add to HNSW index
            index_id = self.next_index_id
            self.index.add_items(vector_array.reshape(1, -1), [index_id])
            
            # Store enhanced metadata (legacy format)
            embedding_metadata = IndexedEmbedding(
                embedding_id=embedding_id,
                owner=owner,
                walrus_hash=walrus_hash,
                metadata_vector=metadata_vector,
                category=category,
                ibe_identity=ibe_identity,
                timestamp=timestamp,
                entities=entities or {},
                relationships=relationships or [],
                temporal_data=temporal_data or {},
                storage_layer=storage_layer,
                similarity_threshold=self.default_similarity_threshold,
                main_vector_encrypted=False,  # Legacy method, no encryption
                encryption_policy={}
            )
            
            self.metadata_store[index_id] = embedding_metadata
            self.embedding_id_to_index[embedding_id] = index_id
            self.next_index_id += 1
            
            logger.debug(f"Added enhanced embedding {embedding_id} to unified index with ID {index_id} (legacy mode)")
            
            # Auto-backup to Walrus if needed
            await self._check_auto_backup()
            
            return index_id
            
        except Exception as e:
            logger.error(f"Failed to add enhanced embedding to index: {e}")
            raise

    async def search_unified(self, 
                           query_vector: np.ndarray, 
                           k: int = 10,
                           filters: Dict[str, Any] = None) -> List[Dict]:
        """
        Unified search for both vector similarity and metadata filtering.
        Single interface for all search needs.
        """
        try:
            # Normalize query vector
            norm = np.linalg.norm(query_vector)
            if norm > 0:
                query_vector = query_vector / norm
            
            # Get more results for filtering
            search_k = min(k * 3, len(self.metadata_store))  
            if search_k == 0:
                return []
            
            # HNSW vector similarity search
            labels, distances = self.index.knn_query(query_vector.reshape(1, -1), k=search_k)
            
            results = []
            filters = filters or {}
            
            for label, distance in zip(labels[0], distances[0]):
                if label not in self.metadata_store:
                    continue
                    
                metadata = self.metadata_store[label]
                similarity_score = 1.0 - distance
                
                # Apply similarity threshold
                if similarity_score < metadata.similarity_threshold:
                    continue
                
                # Apply filters
                if not self._passes_filters(metadata, filters):
                    continue
                
                result = {
                    "embedding_id": metadata.embedding_id,
                    "owner": metadata.owner,
                    "walrus_hash": metadata.walrus_hash,
                    "category": metadata.category,
                    "ibe_identity": metadata.ibe_identity,
                    "timestamp": metadata.timestamp,
                    "similarity_score": similarity_score,
                    "index_id": label,
                    "storage_layer": metadata.storage_layer,
                    # Enhanced metadata (public - entities/relationships in metadata only)
                    "entities": metadata.entities,
                    "relationships": metadata.relationships,
                    "temporal_data": metadata.temporal_data,
                    # Privacy information
                    "main_vector_encrypted": metadata.main_vector_encrypted,
                    "requires_decryption": metadata.main_vector_encrypted,
                    "encryption_policy": metadata.encryption_policy if hasattr(metadata, 'encryption_policy') else {}
                }
                results.append(result)
                
                if len(results) >= k:
                    break
            
            # Sort by similarity score
            results.sort(key=lambda x: x["similarity_score"], reverse=True)
            return results
            
        except Exception as e:
            logger.error(f"Unified search failed: {e}")
            return []

    def _passes_filters(self, metadata: IndexedEmbedding, filters: Dict[str, Any]) -> bool:
        """Apply metadata filters to search results"""
        try:
            # Category filter
            if filters.get('category') and metadata.category != filters['category']:
                return False
            
            # Owner filter
            if filters.get('owner') and metadata.owner != filters['owner']:
                return False
            
            # Storage layer filter
            if filters.get('storage_layer') and metadata.storage_layer != filters['storage_layer']:
                return False
            
            # Entity type filter
            if filters.get('entity_type'):
                target_type = filters['entity_type']
                if not any(entity.get('entity_type') == target_type for entity in metadata.entities.values()):
                    return False
            
            # Entity semantic meaning filter
            if filters.get('entity_meaning'):
                target_meaning = filters['entity_meaning'].lower()
                if not any(target_meaning in entity.get('semantic_meaning', '').lower() 
                          for entity in metadata.entities.values()):
                    return False
            
            # Relationship type filter
            if filters.get('relationship_type'):
                target_rel = filters['relationship_type']
                if not any(rel.get('relationship_type') == target_rel for rel in metadata.relationships):
                    return False
            
            # Temporal filter (after specific date)
            if filters.get('after_date'):
                try:
                    from datetime import datetime
                    after_date = datetime.fromisoformat(filters['after_date'])
                    metadata_date = datetime.fromisoformat(metadata.timestamp)
                    if metadata_date <= after_date:
                        return False
                except:
                    pass  # Skip temporal filter if date parsing fails
            
            # Confidence score filter
            if filters.get('min_confidence'):
                min_conf = filters['min_confidence']
                # Check entity confidence scores
                if metadata.entities:
                    max_entity_conf = max((entity.get('confidence_score', 0) for entity in metadata.entities.values()), default=0)
                    if max_entity_conf < min_conf:
                        return False
                
                # Check relationship confidence scores
                if metadata.relationships:
                    max_rel_conf = max((rel.get('confidence_score', 0) for rel in metadata.relationships), default=0)
                    if max_rel_conf < min_conf:
                        return False
            
            return True
            
        except Exception as e:
            logger.warning(f"Filter application failed: {e}")
            return True  # Default to include if filter fails

    async def query_by_entity(self, entity_type: str = None, 
                            entity_meaning: str = None,
                            k: int = 10) -> List[Dict]:
        """Query embeddings by entity information"""
        filters = {}
        if entity_type:
            filters['entity_type'] = entity_type
        if entity_meaning:
            filters['entity_meaning'] = entity_meaning
        
        # Use a generic query vector (could be improved with entity embeddings)
        query_vector = np.zeros(self.vector_dimension, dtype=np.float32)
        
        # Get all results and filter by metadata
        all_results = []
        for index_id, metadata in self.metadata_store.items():
            if self._passes_filters(metadata, filters):
                result = {
                    "embedding_id": metadata.embedding_id,
                    "owner": metadata.owner,
                    "walrus_hash": metadata.walrus_hash,
                    "category": metadata.category,
                    "entities": metadata.entities,
                    "relationships": metadata.relationships,
                    "similarity_score": 1.0,  # Max score for exact entity matches
                    "index_id": index_id
                }
                all_results.append(result)
        
        return all_results[:k]

    async def query_by_relationship(self, relationship_type: str,
                                  source_entity: str = None,
                                  destination_entity: str = None,
                                  k: int = 10) -> List[Dict]:
        """Query embeddings by relationship information"""
        results = []
        
        for index_id, metadata in self.metadata_store.items():
            for rel in metadata.relationships:
                if rel.get('relationship_type') != relationship_type:
                    continue
                
                if source_entity and rel.get('source_entity') != source_entity:
                    continue
                    
                if destination_entity and rel.get('destination_entity') != destination_entity:
                    continue
                
                result = {
                    "embedding_id": metadata.embedding_id,
                    "owner": metadata.owner,
                    "walrus_hash": metadata.walrus_hash,
                    "relationship": rel,
                    "entities": metadata.entities,
                    "similarity_score": rel.get('confidence_score', 1.0),
                    "index_id": index_id
                }
                results.append(result)
                
                if len(results) >= k:
                    break
        
        # Sort by relationship confidence
        results.sort(key=lambda x: x["similarity_score"], reverse=True)
        return results[:k]
    
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

    async def backup_to_walrus_quilt(self, user_id_filter: str = None) -> Optional[str]:
        """Backup enhanced index to Walrus using Quilt architecture"""
        try:
            from models import MemoryStorageComponents, EntityInfo, RelationshipTriplet
            
            # Filter by user if specified
            filtered_metadata = self.metadata_store
            if user_id_filter:
                filtered_metadata = {
                    k: v for k, v in self.metadata_store.items() 
                    if v.owner == user_id_filter
                }
            
            if not filtered_metadata:
                logger.warning("No metadata to backup")
                return None
            
            # Serialize HNSW index
            import tempfile
            import os
            
            with tempfile.TemporaryDirectory() as temp_dir:
                temp_path = os.path.join(temp_dir, "enhanced_index")
                
                # Save index temporarily
                self.index.save_index(f"{temp_path}.hnsw")
                
                # Read index data
                with open(f"{temp_path}.hnsw", 'rb') as f:
                    vector_index_data = f.read()
            
            # Extract entities and relationships from all metadata
            all_entities = {}
            all_relationships = []
            
            for metadata in filtered_metadata.values():
                # Convert entity dicts to EntityInfo objects
                for entity_id, entity_data in metadata.entities.items():
                    if entity_id not in all_entities:
                        all_entities[entity_id] = EntityInfo(
                            entity_type=entity_data.get('entity_type', 'Unknown'),
                            creation_timestamp=entity_data.get('creation_timestamp', metadata.timestamp),
                            semantic_meaning=entity_data.get('semantic_meaning', ''),
                            confidence_score=entity_data.get('confidence_score', 0.8)
                        )
                
                # Convert relationship dicts to RelationshipTriplet objects
                for rel_data in metadata.relationships:
                    all_relationships.append(RelationshipTriplet(
                        source_entity=rel_data.get('source_entity', ''),
                        relationship_type=rel_data.get('relationship_type', ''),
                        destination_entity=rel_data.get('destination_entity', ''),
                        confidence_score=rel_data.get('confidence_score', 0.8),
                        temporal_context=rel_data.get('temporal_context')
                    ))
            
            # Create temporal metadata
            temporal_metadata = {
                "backup_timestamp": datetime.datetime.now().isoformat(),
                "total_embeddings": str(len(filtered_metadata)),
                "vector_dimension": str(self.vector_dimension),
                "last_processed_checkpoint": str(self.last_processed_checkpoint)
            }
            
            # Create retrieval config
            retrieval_config = {
                "similarity_threshold": str(self.default_similarity_threshold),
                "max_elements": str(self.max_elements),
                "ef_construction": str(self.ef_construction),
                "m": str(self.m)
            }
            
            # Create memory components
            components = MemoryStorageComponents(
                vector_index_data=vector_index_data,
                entity_metadata=all_entities,
                relationship_graph=all_relationships,
                temporal_metadata=temporal_metadata,
                retrieval_config=retrieval_config
            )
            
            # Store in Walrus Quilt
            quilt_id = await self.walrus_client.store_memory_components_quilt(
                components, 
                user_id_filter or "system",
                epochs=200  # Long-term storage
            )
            
            logger.info(f"Backed up enhanced index to Walrus Quilt: {quilt_id}")
            return quilt_id
            
        except Exception as e:
            logger.error(f"Failed to backup enhanced index to Walrus: {e}")
            return None

    async def load_from_walrus_quilt(self, quilt_id: str, user_id: str) -> bool:
        """Load enhanced index from Walrus Quilt"""
        try:
            # Retrieve memory components
            components = await self.walrus_client.retrieve_memory_components_from_quilt(quilt_id, user_id)
            
            if not components:
                logger.error(f"Failed to retrieve components from Quilt {quilt_id}")
                return False
            
            # Restore HNSW index
            if components.vector_index_data:
                import tempfile
                import os
                
                with tempfile.TemporaryDirectory() as temp_dir:
                    temp_path = os.path.join(temp_dir, "restored_index.hnsw")
                    
                    # Write index data
                    with open(temp_path, 'wb') as f:
                        f.write(components.vector_index_data)
                    
                    # Load index
                    self.index.load_index(temp_path)
            
            # Restore enhanced metadata
            restored_count = 0
            for entity_id, entity_info in components.entity_metadata.items():
                # Find corresponding embeddings (simplified approach)
                # In production, you'd maintain better entity->embedding mapping
                pass
            
            # Update configuration from retrieved config
            if components.retrieval_config:
                self.default_similarity_threshold = float(components.retrieval_config.get('similarity_threshold', 0.8))
            
            logger.info(f"Loaded enhanced index from Walrus Quilt: {quilt_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to load enhanced index from Walrus: {e}")
            return False

    async def _check_auto_backup(self):
        """Check if auto-backup to Walrus is needed"""
        try:
            # Auto-backup every 1000 embeddings or based on time
            if (len(self.metadata_store) % 1000 == 0 and len(self.metadata_store) > 0) or \
               (hasattr(self, '_last_backup_time') and 
                (datetime.datetime.now() - self._last_backup_time).seconds > self.index_backup_interval):
                
                logger.info("Performing auto-backup to Walrus Quilt...")
                quilt_id = await self.backup_to_walrus_quilt()
                if quilt_id:
                    self._last_backup_time = datetime.datetime.now()
                    logger.info(f"Auto-backup completed: {quilt_id}")
                    
        except Exception as e:
            logger.warning(f"Auto-backup failed: {e}")

    async def get_enhanced_stats(self) -> Dict:
        """Get enhanced indexer statistics"""
        stats = self.get_stats()  # Get base stats
        
        # Add enhanced statistics
        entity_types = {}
        relationship_types = {}
        storage_layers = {"main_context": 0, "external_context": 0}
        
        for metadata in self.metadata_store.values():
            # Count entity types
            for entity in metadata.entities.values():
                entity_type = entity.get('entity_type', 'Unknown')
                entity_types[entity_type] = entity_types.get(entity_type, 0) + 1
            
            # Count relationship types
            for rel in metadata.relationships:
                rel_type = rel.get('relationship_type', 'Unknown')
                relationship_types[rel_type] = relationship_types.get(rel_type, 0) + 1
            
            # Count storage layers
            storage_layers[metadata.storage_layer] += 1
        
        stats.update({
            "enhanced_features": True,
            "entity_types": entity_types,
            "relationship_types": relationship_types,
            "storage_layers": storage_layers,
            "total_entities": sum(len(m.entities) for m in self.metadata_store.values()),
            "total_relationships": sum(len(m.relationships) for m in self.metadata_store.values()),
            "walrus_integration": True
        })
        
        return stats
    
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
