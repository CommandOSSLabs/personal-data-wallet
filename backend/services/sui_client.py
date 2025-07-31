import httpx
import json
from typing import Dict, Any, Optional
from config import settings

class SuiClient:
    def __init__(self):
        self.rpc_url = settings.sui_rpc_url
        self.client = httpx.AsyncClient()

    async def call_rpc(self, method: str, params: list) -> Dict[str, Any]:
        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": method,
            "params": params
        }
        
        try:
            response = await self.client.post(
                self.rpc_url,
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Sui RPC call failed: {e}")
            return {"error": str(e)}

    async def ingest_memory(self, user_id: str, graph_json: str, vector: list) -> Dict[str, Any]:
        # This would call the Sui smart contract's ingest function
        # For now, we'll simulate this with a mock response
        
        # In a real implementation, this would:
        # 1. Call the smart contract's ingest function
        # 2. Pass the user_id, graph_json, and vector
        # 3. Handle the transaction and wait for confirmation
        
        return {
            "success": True,
            "transaction_digest": "mock_transaction_digest",
            "events": [
                {
                    "type": "IngestionRequested",
                    "user": user_id,
                    "graph_json": graph_json[:100] + "..." if len(graph_json) > 100 else graph_json,
                    "vector_length": len(vector)
                }
            ]
        }

    async def finalize_update(self, user_id: str, vector_cert: str, graph_cert: str) -> Dict[str, Any]:
        # This would call the Sui smart contract's finalize_update function
        # For now, we'll simulate this with a mock response
        
        return {
            "success": True,
            "transaction_digest": "mock_finalize_transaction",
            "memory_object_updated": True,
            "vector_cert": vector_cert,
            "graph_cert": graph_cert
        }

    async def get_memory_object(self, user_id: str) -> Optional[Dict[str, Any]]:
        # This would query the user's MemoryObject from Sui
        # For now, we'll return a mock object
        
        return {
            "user_id": user_id,
            "vector_index_cert": "mock_vector_cert",
            "graph_cert": "mock_graph_cert",
            "last_updated": "2024-01-01T00:00:00Z"
        }

    async def add_embedding(self, 
                          walrus_hash: str,
                          metadata_vector: list,
                          category: str,
                          ibe_identity: str,
                          policy_hash: str,
                          user_address: str,
                          user_signature: str) -> str:
        """Add embedding to the SUI blockchain vector index contract."""
        try:
            import time
            
            # Convert metadata_vector to u64 format (scaled integers) for Sui
            # Scale float values to integers (multiply by 1000 and convert to u64)
            metadata_vector_u64 = []
            for val in metadata_vector:
                if isinstance(val, (int, float)):
                    # Scale to avoid precision loss and ensure positive values
                    scaled_val = int(abs(float(val)) * 10000)  # Scale by 10000
                    metadata_vector_u64.append(min(scaled_val, 2**63 - 1))  # Cap at max u64
                else:
                    metadata_vector_u64.append(0)
            
            # Prepare transaction data for Sui vector_index contract
            transaction_data = {
                "package_id": "0x0",  # This would be the actual deployed package ID
                "module": "vector_index",
                "function": "add_embedding",
                "arguments": [
                    "0x0",  # registry object ID - would be actual shared object
                    walrus_hash.encode(),
                    metadata_vector_u64,
                    category.encode(),
                    ibe_identity.encode(),
                    policy_hash.encode()
                ],
                "type_arguments": [],
                "sender": user_address,
                "gas_budget": 10000000
            }
            
            # For development, simulate the transaction but log real data
            embedding_id = f"sui_embedding_{int(time.time() * 1000000)}"
            
            print(f"[SUI CONTRACT] Adding embedding to blockchain:")
            print(f"  Embedding ID: {embedding_id}")
            print(f"  Walrus hash: {walrus_hash}")
            print(f"  Metadata vector length: {len(metadata_vector_u64)}")
            print(f"  Category: {category}")
            print(f"  User: {user_address}")
            print(f"  IBE Identity: {ibe_identity}")
            
            # In production, this would call:
            # response = await self.call_rpc("sui_executeTransactionBlock", [transaction_data])
            # embedding_id = extract_embedding_id_from_events(response)
            
            return embedding_id
        except Exception as e:
            print(f"Failed to add embedding to SUI: {e}")
            raise

    async def close(self):
        await self.client.aclose()