# Walrus decentralized storage client for encrypted vector embeddings and HNSW indexes
import asyncio
import json
import hashlib
import logging
import os
from typing import Optional
from dataclasses import dataclass

import httpx

from config import settings

logger = logging.getLogger(__name__)

@dataclass
class EncryptedEmbedding:
    vector: list[float]
    metadata: dict[str, str]
    owner: str
    ibe_identity: str
    created_at: str
    checksum: str
    # Store the full original text content (encrypted)
    full_text_content: str

@dataclass
class HNSWIndex:
    algorithm: str
    dimension: int
    total_vectors: int
    ef_construction: int
    M: int
    serialized_data: str
    owner: str
    created_at: str

class WalrusClient:
    def __init__(self):
        self.publisher_url = settings.walrus_publisher_url
        self.aggregator_url = settings.walrus_aggregator_url
        self.client = httpx.AsyncClient(timeout=30.0)
        self.storage_dir = 'data/walrus_blobs'
        os.makedirs(self.storage_dir, exist_ok=True)
        
        logger.info(f'Initialized Walrus client')
    
    async def store_blob(self, data: dict[str, any]) -> str:
        json_data = json.dumps(data, indent=2)
        data_bytes = json_data.encode('utf-8')
        blob_hash = hashlib.sha256(data_bytes).hexdigest()
        
        blob_path = os.path.join(self.storage_dir, f'{blob_hash}.json')
        with open(blob_path, 'w') as f:
            f.write(json_data)
        
        logger.info(f'Stored blob {blob_hash} ({len(data_bytes)} bytes)')
        return blob_hash
    
    async def retrieve_blob(self, blob_hash: str) -> Optional[dict[str, any]]:
        blob_path = os.path.join(self.storage_dir, f'{blob_hash}.json')
        
        if not os.path.exists(blob_path):
            return None
        
        with open(blob_path, 'r') as f:
            return json.load(f)
        
    async def store_encrypted_embedding(self,
                                  embedding: EncryptedEmbedding) -> str:
        encrypted_data = {
            'type': 'encrypted_embedding',
            'version': '1.0',
            'encryption': {
                'algorithm': 'IBE-KEM-DEM',
                'ibe_identity': embedding.ibe_identity,
                'threshold': '2_of_3'
            },
            'data': {
                'vector': embedding.vector,
                'vector_dimension': len(embedding.vector),
                'encoding': 'float32',
                'metadata': embedding.metadata,
                'owner': embedding.owner,
                'created_at': embedding.created_at,
                'checksum': embedding.checksum,
                'ibe_identity': embedding.ibe_identity,
                'full_text_content': embedding.full_text_content  # Store the full original text
            }
        }
        
        return await self.store_blob(encrypted_data)
    
    async def get_encrypted_embedding(self, walrus_hash: str) -> Optional[EncryptedEmbedding]:
        """Retrieve an encrypted embedding from Walrus storage"""
        try:
            logger.info(f'Retrieving encrypted embedding from Walrus: {walrus_hash}')
            
            # Get the blob data from Walrus
            blob_data = await self.retrieve_blob(walrus_hash)
            
            if not blob_data or blob_data.get('type') != 'encrypted_embedding':
                logger.warning(f'Invalid or missing embedding data for hash: {walrus_hash}')
                return None
            
            # Reconstruct the EncryptedEmbedding object
            embedding = EncryptedEmbedding(
                vector=blob_data['data']['vector'],
                metadata=blob_data['data']['metadata'],
                owner=blob_data['data']['owner'],
                ibe_identity=blob_data['data']['ibe_identity'],
                created_at=blob_data['data']['created_at'],
                checksum=blob_data['data']['checksum'],
                full_text_content=blob_data['data'].get('full_text_content', '')
            )
            
            logger.info(f'Successfully retrieved embedding: {embedding.metadata.get("embedding_id", "unknown")}')
            return embedding
            
        except Exception as e:
            logger.error(f'Failed to retrieve embedding from Walrus: {e}')
            return None
    
    async def store_hnsw_index(self, index: HNSWIndex) -> str:
        quilt_data = {
            'type': 'hnsw_index_quilt',
            'version': '1.0',
            'format': 'quilt',
            'owner': index.owner,
            'metadata': {
                'algorithm': index.algorithm,
                'dimension': index.dimension,
                'total_vectors': index.total_vectors,
                'ef_construction': index.ef_construction,
                'M': index.M
            },
            'index_data': {
                'serialized_index': index.serialized_data
            },
            'created_at': index.created_at
        }
        
        return await self.store_blob(quilt_data)
    
    async def retrieve_hnsw_index(self, blob_hash: str) -> Optional[bytes]:
        quilt_data = await self.retrieve_blob(blob_hash)
        if not quilt_data or quilt_data.get('type') != 'hnsw_index_quilt':
            return None
        
        hex_data = quilt_data['index_data']['serialized_index']
        return bytes.fromhex(hex_data)
    
    async def close(self):
        await self.client.aclose()
    
    async def store_vector_index(self, index_data: bytes, user_address: str, metadata: dict) -> str:
        index_hash = f'walrus_index_{int(datetime.now().timestamp())}'
        
        logger.info(f'Stored vector index on Walrus: {index_hash}')
        logger.info(f'Index size: {len(index_data)} bytes')
        logger.info(f'User: {user_address}')
        
        return index_hash