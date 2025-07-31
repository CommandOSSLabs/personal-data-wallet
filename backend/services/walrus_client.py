import httpx
import json
from datetime import datetime
from typing import Dict, Any, Optional, List
from config import settings
from models import (
    QuiltBlob, QuiltResponse, QuiltPatchInfo, EmbeddingResult, 
    EmbeddingQuiltData, VectorIndexQuiltData, MemoryStorageComponents,
    EnhancedEmbeddingQuiltData, EntityInfo, RelationshipTriplet
)

class WalrusClient:
    def __init__(self):
        self.publisher_url = settings.walrus_publisher_url
        self.aggregator_url = settings.walrus_aggregator_url
        self.client = httpx.AsyncClient(timeout=60.0)

    async def _retry_request(self, operation, max_retries: int = 3, backoff_factor: float = 1.0):
        """Generic retry wrapper for HTTP requests with exponential backoff"""
        import asyncio
        
        for attempt in range(max_retries):
            try:
                return await operation()
            except httpx.TimeoutException as e:
                if attempt == max_retries - 1:
                    raise Exception(f"Request timed out after {max_retries} attempts: {e}")
                wait_time = backoff_factor * (2 ** attempt)
                print(f"Request timeout, retrying in {wait_time}s... (attempt {attempt + 1}/{max_retries})")
                await asyncio.sleep(wait_time)
            except httpx.NetworkError as e:
                if attempt == max_retries - 1:
                    raise Exception(f"Network error after {max_retries} attempts: {e}")
                wait_time = backoff_factor * (2 ** attempt)
                print(f"Network error, retrying in {wait_time}s... (attempt {attempt + 1}/{max_retries})")
                await asyncio.sleep(wait_time)
            except Exception as e:
                # For other exceptions, don't retry
                raise e

    async def store_blob(self, data: bytes, epochs: int = 5, deletable: bool = False) -> Optional[str]:
        """Store data as a blob on Walrus using HTTP API with retry logic"""
        async def _store_operation():
            url = f"{self.publisher_url}/v1/blobs"
            params = {"epochs": epochs}
            if deletable:
                params["deletable"] = "true"
            
            response = await self.client.put(
                url,
                params=params,
                content=data,
                headers={"Content-Type": "application/octet-stream"}
            )
            
            if response.status_code == 200:
                result = response.json()
                if "newlyCreated" in result:
                    return result["newlyCreated"]["blobObject"]["blobId"]
                elif "alreadyCertified" in result:
                    return result["alreadyCertified"]["blobId"]
            
            raise Exception(f"Failed to store blob: {response.status_code} - {response.text}")
        
        try:
            return await self._retry_request(_store_operation)
        except Exception as e:
            print(f"Error storing blob on Walrus: {e}")
            return None

    async def retrieve_blob(self, blob_id: str) -> Optional[bytes]:
        """Retrieve blob data from Walrus using HTTP API with retry logic"""
        async def _retrieve_operation():
            url = f"{self.aggregator_url}/v1/blobs/{blob_id}"
            response = await self.client.get(url)
            
            if response.status_code == 200:
                return response.content
            
            raise Exception(f"Failed to retrieve blob {blob_id}: {response.status_code}")
        
        try:
            return await self._retry_request(_retrieve_operation)
        except Exception as e:
            print(f"Error retrieving blob from Walrus: {e}")
            return None

    async def store_quilt(self, blobs: List[QuiltBlob], epochs: int = 5) -> Optional[QuiltResponse]:
        """Store multiple blobs as a quilt for batch optimization"""
        try:
            url = f"{self.publisher_url}/v1/quilts"
            params = {"epochs": epochs}
            
            # Prepare multipart form data
            files = []
            metadata_list = []
            
            for blob in blobs:
                files.append((blob.identifier, (blob.identifier, blob.data, "application/octet-stream")))
                metadata_list.append({
                    "identifier": blob.identifier,
                    "tags": blob.metadata
                })
            
            # Add metadata as JSON
            if metadata_list:
                files.append(("_metadata", ("metadata.json", json.dumps(metadata_list), "application/json")))
            
            response = await self.client.put(url, params=params, files=files)
            
            if response.status_code == 200:
                result = response.json()
                # Parse quilt response and extract patch information
                patches = []
                quilt_id = None
                
                if "newlyCreated" in result:
                    quilt_data = result["newlyCreated"]
                    quilt_id = quilt_data.get("quiltId")
                    
                    # Extract patch information
                    for i, blob in enumerate(blobs):
                        patch_info = QuiltPatchInfo(
                            patch_id=f"patch_{i}",  # This would come from actual response
                            identifier=blob.identifier,
                            size=len(blob.data)
                        )
                        patches.append(patch_info)
                
                return QuiltResponse(
                    quilt_id=quilt_id or f"quilt_{hash(str(blobs)) % 1000000}",
                    patches=patches,
                    total_cost=result.get("cost")
                )
            
            print(f"Failed to store quilt: {response.status_code} - {response.text}")
            return None
            
        except Exception as e:
            print(f"Error storing quilt on Walrus: {e}")
            return None

    async def retrieve_from_quilt_by_patch_id(self, patch_id: str) -> Optional[bytes]:
        """Retrieve blob from quilt using patch ID"""
        try:
            url = f"{self.aggregator_url}/v1/blobs/by-quilt-patch-id/{patch_id}"
            response = await self.client.get(url)
            
            if response.status_code == 200:
                return response.content
            
            print(f"Failed to retrieve blob by patch ID {patch_id}: {response.status_code}")
            return None
            
        except Exception as e:
            print(f"Error retrieving blob by patch ID: {e}")
            return None

    async def retrieve_from_quilt_by_id(self, quilt_id: str, identifier: str) -> Optional[bytes]:
        """Retrieve specific blob from quilt using quilt ID and identifier"""
        try:
            url = f"{self.aggregator_url}/v1/blobs/by-quilt-id/{quilt_id}/{identifier}"
            response = await self.client.get(url)
            
            if response.status_code == 200:
                return response.content
            
            print(f"Failed to retrieve blob {identifier} from quilt {quilt_id}: {response.status_code}")
            return None
            
        except Exception as e:
            print(f"Error retrieving blob from quilt: {e}")
            return None

    async def store_embeddings_quilt(self, embedding_data: EmbeddingQuiltData) -> Optional[str]:
        """Store vector embeddings as an optimized quilt"""
        try:
            blobs = []
            
            for i, embedding in enumerate(embedding_data.embeddings):
                # Serialize embedding as JSON
                embedding_json = {
                    "vector": embedding.vector,
                    "text": embedding.text,
                    "user_id": embedding_data.user_id,
                    "index": i
                }
                
                blob_data = json.dumps(embedding_json).encode('utf-8')
                identifier = f"embedding_{i:06d}"
                
                metadata = {
                    "type": "embedding",
                    "user_id": embedding_data.user_id,
                    "index": str(i),
                    "text_length": str(len(embedding.text))
                }
                metadata.update(embedding_data.metadata)
                
                blobs.append(QuiltBlob(
                    identifier=identifier,
                    data=blob_data,
                    metadata=metadata
                ))
            
            result = await self.store_quilt(blobs, epochs=100)  # Long-term storage for embeddings
            return result.quilt_id if result else None
            
        except Exception as e:
            print(f"Error storing embeddings quilt: {e}")
            return None

    async def store_hnsw_index_quilt(self, index_data: VectorIndexQuiltData) -> Optional[str]:
        """Store HNSW index files as a quilt"""
        try:
            blobs = []
            
            for filename, file_content in index_data.index_files.items():
                metadata = {
                    "type": "hnsw_index",
                    "user_id": index_data.user_id,
                    "filename": filename,
                    "size": str(len(file_content))
                }
                metadata.update(index_data.metadata)
                
                blobs.append(QuiltBlob(
                    identifier=filename,
                    data=file_content,
                    metadata=metadata
                ))
            
            result = await self.store_quilt(blobs, epochs=200)  # Very long-term storage for indices
            return result.quilt_id if result else None
            
        except Exception as e:
            print(f"Error storing HNSW index quilt: {e}")
            return None

    async def store_memory_components_quilt(self, components: MemoryStorageComponents, 
                                          user_id: str, epochs: int = 200) -> Optional[str]:
        """Store memory components as separate blobs in a quilt following mem0 patterns"""
        try:
            blobs = []
            
            # 1. Vector Index Data (dense embeddings - like mem0's vector database layer)
            blobs.append(QuiltBlob(
                identifier=f"vector_index_{user_id}",
                data=components.vector_index_data,
                metadata={
                    "component_type": "vector_index",
                    "user_id": user_id,
                    "mem0_layer": "dense_embeddings",
                    "storage_priority": "external_context",
                    "timestamp": datetime.now().isoformat()
                }
            ))
            
            # 2. Entity Metadata (entity information - like mem0's entity graph)
            entity_data = json.dumps({
                entity_id: entity_info.dict() 
                for entity_id, entity_info in components.entity_metadata.items()
            }).encode('utf-8')
            
            blobs.append(QuiltBlob(
                identifier=f"entity_metadata_{user_id}",
                data=entity_data,
                metadata={
                    "component_type": "entity_metadata",
                    "user_id": user_id,
                    "mem0_layer": "entity_graph",
                    "entity_count": str(len(components.entity_metadata)),
                    "timestamp": datetime.now().isoformat()
                }
            ))
            
            # 3. Relationship Graph (triplets - like mem0's relationship store)
            relationship_data = json.dumps([
                triplet.dict() for triplet in components.relationship_graph
            ]).encode('utf-8')
            
            blobs.append(QuiltBlob(
                identifier=f"relationship_graph_{user_id}",
                data=relationship_data,
                metadata={
                    "component_type": "relationship_graph",
                    "user_id": user_id,
                    "mem0_layer": "relationship_triplets",
                    "triplet_count": str(len(components.relationship_graph)),
                    "timestamp": datetime.now().isoformat()
                }
            ))
            
            # 4. Temporal Metadata (time-based information)
            temporal_data = json.dumps(components.temporal_metadata).encode('utf-8')
            
            blobs.append(QuiltBlob(
                identifier=f"temporal_metadata_{user_id}",
                data=temporal_data,
                metadata={
                    "component_type": "temporal_metadata",
                    "user_id": user_id,
                    "mem0_layer": "temporal_context",
                    "timestamp": datetime.now().isoformat()
                }
            ))
            
            # 5. Retrieval Configuration (similarity thresholds, indexing params)
            config_data = json.dumps(components.retrieval_config).encode('utf-8')
            
            blobs.append(QuiltBlob(
                identifier=f"retrieval_config_{user_id}",
                data=config_data,
                metadata={
                    "component_type": "retrieval_config",
                    "user_id": user_id,
                    "mem0_layer": "config",
                    "timestamp": datetime.now().isoformat()
                }
            ))
            
            # Store with long-term epochs for persistent memory storage
            result = await self.store_quilt(blobs, epochs=epochs)
            return result.quilt_id if result else None
            
        except Exception as e:
            print(f"Error storing memory components on Walrus: {e}")
            return None

    async def retrieve_memory_components_from_quilt(self, quilt_id: str, 
                                                  user_id: str) -> Optional[MemoryStorageComponents]:
        """Retrieve memory components from quilt following mem0 separation"""
        try:
            components = {}
            
            # Retrieve each component by identifier
            component_identifiers = [
                f"vector_index_{user_id}",
                f"entity_metadata_{user_id}",
                f"relationship_graph_{user_id}",
                f"temporal_metadata_{user_id}",
                f"retrieval_config_{user_id}"
            ]
            
            for identifier in component_identifiers:
                try:
                    data = await self.retrieve_from_quilt_by_id(quilt_id, identifier)
                    if data:
                        components[identifier] = data
                except:
                    continue  # Component might not exist
            
            # Parse components
            vector_index_data = components.get(f"vector_index_{user_id}", b"")
            
            entity_metadata = {}
            if f"entity_metadata_{user_id}" in components:
                entity_json = json.loads(components[f"entity_metadata_{user_id}"].decode('utf-8'))
                entity_metadata = {
                    entity_id: EntityInfo(**entity_info) 
                    for entity_id, entity_info in entity_json.items()
                }
            
            relationship_graph = []
            if f"relationship_graph_{user_id}" in components:
                relationship_json = json.loads(components[f"relationship_graph_{user_id}"].decode('utf-8'))
                relationship_graph = [RelationshipTriplet(**triplet) for triplet in relationship_json]
            
            temporal_metadata = {}
            if f"temporal_metadata_{user_id}" in components:
                temporal_metadata = json.loads(components[f"temporal_metadata_{user_id}"].decode('utf-8'))
            
            retrieval_config = {}
            if f"retrieval_config_{user_id}" in components:
                retrieval_config = json.loads(components[f"retrieval_config_{user_id}"].decode('utf-8'))
            
            return MemoryStorageComponents(
                vector_index_data=vector_index_data,
                entity_metadata=entity_metadata,
                relationship_graph=relationship_graph,
                temporal_metadata=temporal_metadata,
                retrieval_config=retrieval_config
            )
            
        except Exception as e:
            print(f"Error retrieving memory components from quilt: {e}")
            return None

    async def store_enhanced_embeddings_quilt(self, enhanced_data: EnhancedEmbeddingQuiltData, 
                                            epochs: int = 200) -> Optional[str]:
        """Store enhanced embeddings following mem0 hierarchical patterns"""
        try:
            # Determine storage strategy based on mem0 patterns
            if enhanced_data.storage_layer == "main_context":
                # For main context: store with shorter epochs, optimize for speed
                epochs = min(epochs, 50)
            else:
                # For external context: store with longer epochs, optimize for durability
                epochs = max(epochs, 100)
            
            blobs = []
            
            # Store embeddings with enhanced metadata
            for i, embedding in enumerate(enhanced_data.embeddings):
                embedding_json = {
                    "vector": embedding.vector,
                    "text": embedding.text,
                    "user_id": enhanced_data.user_id,
                    "index": i,
                    "storage_layer": enhanced_data.storage_layer
                }
                
                blob_data = json.dumps(embedding_json).encode('utf-8')
                identifier = f"enhanced_embedding_{i:06d}"
                
                # Mem0-inspired metadata structure
                metadata = {
                    "type": "enhanced_embedding",
                    "user_id": enhanced_data.user_id,
                    "index": str(i),
                    "storage_layer": enhanced_data.storage_layer,
                    "mem0_type": "dense_embedding",
                    "text_length": str(len(embedding.text))
                }
                
                # Add entity metadata if available
                if enhanced_data.entity_metadata:
                    metadata["has_entities"] = "true"
                    metadata["entity_count"] = str(len(enhanced_data.entity_metadata))
                
                # Add relationship metadata if available
                if enhanced_data.relationship_metadata:
                    metadata["has_relationships"] = "true"
                    metadata["relationship_count"] = str(len(enhanced_data.relationship_metadata))
                
                metadata.update(enhanced_data.retrieval_metadata)
                
                blobs.append(QuiltBlob(
                    identifier=identifier,
                    data=blob_data,
                    metadata=metadata
                ))
            
            # Store entities and relationships as separate blobs (mem0 pattern)
            if enhanced_data.entity_metadata:
                entity_blob_data = json.dumps({
                    entity_id: entity_info.dict() 
                    for entity_id, entity_info in enhanced_data.entity_metadata.items()
                }).encode('utf-8')
                
                blobs.append(QuiltBlob(
                    identifier="entity_graph",
                    data=entity_blob_data,
                    metadata={
                        "type": "entity_graph",
                        "user_id": enhanced_data.user_id,
                        "mem0_component": "entity_metadata",
                        "entity_count": str(len(enhanced_data.entity_metadata))
                    }
                ))
            
            if enhanced_data.relationship_metadata:
                relationship_blob_data = json.dumps([
                    triplet.dict() for triplet in enhanced_data.relationship_metadata
                ]).encode('utf-8')
                
                blobs.append(QuiltBlob(
                    identifier="relationship_triplets",
                    data=relationship_blob_data,
                    metadata={
                        "type": "relationship_triplets",
                        "user_id": enhanced_data.user_id,
                        "mem0_component": "relationship_graph",
                        "triplet_count": str(len(enhanced_data.relationship_metadata))
                    }
                ))
            
            result = await self.store_quilt(blobs, epochs=epochs)
            return result.quilt_id if result else None
            
        except Exception as e:
            print(f"Error storing enhanced embeddings quilt: {e}")
            return None

    async def retrieve_enhanced_embeddings_from_quilt(self, quilt_id: str, 
                                                    user_id: str) -> Optional[EnhancedEmbeddingQuiltData]:
        """Retrieve enhanced embeddings with mem0 separation"""
        try:
            embeddings = []
            entity_metadata = {}
            relationship_metadata = []
            retrieval_metadata = {}
            temporal_metadata = {}
            
            # Retrieve embeddings (similar to existing method but enhanced)
            for i in range(1000):  # Max attempt limit
                identifier = f"enhanced_embedding_{i:06d}"
                
                try:
                    data = await self.retrieve_from_quilt_by_id(quilt_id, identifier)
                    if data is None:
                        break
                    
                    embedding_json = json.loads(data.decode('utf-8'))
                    embeddings.append(EmbeddingResult(
                        vector=embedding_json["vector"],
                        text=embedding_json["text"]
                    ))
                    
                except:
                    break
            
            # Retrieve entity graph
            try:
                entity_data = await self.retrieve_from_quilt_by_id(quilt_id, "entity_graph")
                if entity_data:
                    entity_json = json.loads(entity_data.decode('utf-8'))
                    entity_metadata = {
                        entity_id: EntityInfo(**entity_info) 
                        for entity_id, entity_info in entity_json.items()
                    }
            except:
                pass
            
            # Retrieve relationship triplets
            try:
                relationship_data = await self.retrieve_from_quilt_by_id(quilt_id, "relationship_triplets")
                if relationship_data:
                    relationship_json = json.loads(relationship_data.decode('utf-8'))
                    relationship_metadata = [RelationshipTriplet(**triplet) for triplet in relationship_json]
            except:
                pass
            
            return EnhancedEmbeddingQuiltData(
                user_id=user_id,
                embeddings=embeddings,
                entity_metadata=entity_metadata,
                relationship_metadata=relationship_metadata,
                retrieval_metadata=retrieval_metadata,
                temporal_metadata=temporal_metadata,
                storage_layer="external_context"
            ) if embeddings else None
            
        except Exception as e:
            print(f"Error retrieving enhanced embeddings from quilt: {e}")
            return None

    async def retrieve_embeddings_from_quilt(self, quilt_id: str) -> Optional[List[EmbeddingResult]]:
        """Retrieve all embeddings from a quilt"""
        try:
            embeddings = []
            
            # This is a simplified approach - in reality we'd need to query the quilt metadata
            # to know how many embeddings are stored
            for i in range(1000):  # Max attempt limit
                identifier = f"embedding_{i:06d}"
                
                try:
                    data = await self.retrieve_from_quilt_by_id(quilt_id, identifier)
                    if data is None:
                        break  # No more embeddings
                    
                    embedding_json = json.loads(data.decode('utf-8'))
                    embeddings.append(EmbeddingResult(
                        vector=embedding_json["vector"],
                        text=embedding_json["text"]
                    ))
                    
                except:
                    break  # End of embeddings or error
            
            return embeddings if embeddings else None
            
        except Exception as e:
            print(f"Error retrieving embeddings from quilt: {e}")
            return None

    async def retrieve_hnsw_index_from_quilt(self, quilt_id: str) -> Optional[Dict[str, bytes]]:
        """Retrieve HNSW index files from a quilt"""
        try:
            index_files = {}
            
            # Common HNSW index filenames
            for filename in ["index.hnsw", "index.meta"]:
                try:
                    data = await self.retrieve_from_quilt_by_id(quilt_id, filename)
                    if data:
                        index_files[filename] = data
                except:
                    continue  # File might not exist
            
            return index_files if index_files else None
            
        except Exception as e:
            print(f"Error retrieving HNSW index from quilt: {e}")
            return None

    # Legacy methods for backward compatibility
    async def store_vector_index(self, vector_store_data: Dict[str, Any]) -> Optional[str]:
        """Store vector index data on Walrus (legacy method)"""
        data = json.dumps({
            "type": "vector_index",
            "data": vector_store_data
        }).encode('utf-8')
        
        return await self.store_blob(data, epochs=100)

    async def store_knowledge_graph(self, graph_data: Dict[str, Any]) -> Optional[str]:
        """Store knowledge graph data on Walrus (legacy method)"""
        data = json.dumps({
            "type": "knowledge_graph",
            "data": graph_data
        }).encode('utf-8')
        
        return await self.store_blob(data, epochs=100)

    async def close(self):
        await self.client.aclose()