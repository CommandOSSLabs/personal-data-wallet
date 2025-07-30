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

    async def close(self):
        await self.client.aclose()