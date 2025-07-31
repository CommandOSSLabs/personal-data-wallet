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
        """Call the memory_wallet::ingest function on the deployed contract"""
        try:
            # First, we need to get the user's memory object
            # For now, we'll create a new one if it doesn't exist
            memory_object_id = await self.get_or_create_memory_object(user_id)
            if not memory_object_id:
                return {"success": False, "error": "Failed to get memory object"}
            
            # Convert vector to bytes for the contract call
            vector_bytes = str(vector).encode('utf-8')
            graph_bytes = graph_json.encode('utf-8')
            
            # Call the ingest function
            params = [
                memory_object_id,
                list(graph_bytes),  # Convert to list of integers
                list(vector_bytes),  # Convert to list of integers
            ]
            
            result = await self.call_rpc("sui_executeTransactionBlock", [{
                "transaction_kind": {
                    "ProgrammableTransaction": {
                        "inputs": [
                            {"type": "object", "objectId": memory_object_id},
                            {"type": "pure", "valueType": "vector<u8>", "value": list(graph_bytes)},
                            {"type": "pure", "valueType": "vector<u8>", "value": list(vector_bytes)}
                        ],
                        "commands": [{
                            "MoveCall": {
                                "package": settings.sui_package_id,
                                "module": "memory_wallet",
                                "function": "ingest",
                                "arguments": ["Input(0)", "Input(1)", "Input(2)"]
                            }
                        }]
                    }
                },
                "sender": user_id,
                "gasBudget": "10000000"
            }])
            
            if "error" in result:
                print(f"Failed to call ingest: {result['error']}")
                return {"success": False, "error": result["error"]}
            
            return {
                "success": True,
                "transaction_digest": result.get("result", {}).get("digest", "unknown"),
                "events": result.get("result", {}).get("events", [])
            }
            
        except Exception as e:
            print(f"Error in ingest_memory: {e}")
            return {"success": False, "error": str(e)}

    async def get_or_create_memory_object(self, user_id: str) -> str:
        """Get or create a memory object for the user"""
        try:
            # For simplicity, we'll create a new memory object for each user
            # In a production system, you'd want to check if one already exists
            
            result = await self.call_rpc("sui_executeTransactionBlock", [{
                "transaction_kind": {
                    "ProgrammableTransaction": {
                        "inputs": [],
                        "commands": [{
                            "MoveCall": {
                                "package": settings.sui_package_id,
                                "module": "memory_wallet",
                                "function": "create_memory_object",
                                "arguments": []
                            }
                        }]
                    }
                },
                "sender": user_id,
                "gasBudget": "10000000"
            }])
            
            if "error" in result:
                print(f"Failed to create memory object: {result['error']}")
                return None
                
            # Extract the created object ID from the result
            # This would need to be parsed from the transaction effects
            return "mock_memory_object_id"  # Placeholder for now
            
        except Exception as e:
            print(f"Error creating memory object: {e}")
            return None

    async def add_embedding(self, walrus_hash: str, metadata_vector: list, category: str, 
                          ibe_identity: str, policy_hash: str, user_address: str, 
                          user_signature: str) -> str:
        """Add an embedding to the vector index contract"""
        try:
            # Convert metadata_vector to list of integers (scaled)
            metadata_vector_u64 = [int(x * 1000000) for x in metadata_vector[:64]]  # Scale and limit
            
            result = await self.call_rpc("sui_executeTransactionBlock", [{
                "transaction_kind": {
                    "ProgrammableTransaction": {
                        "inputs": [
                            {"type": "object", "objectId": settings.vector_registry_id},
                            {"type": "pure", "valueType": "vector<u8>", "value": list(walrus_hash.encode('utf-8'))},
                            {"type": "pure", "valueType": "vector<u64>", "value": metadata_vector_u64},
                            {"type": "pure", "valueType": "vector<u8>", "value": list(category.encode('utf-8'))},
                            {"type": "pure", "valueType": "vector<u8>", "value": list(ibe_identity.encode('utf-8'))},
                            {"type": "pure", "valueType": "vector<u8>", "value": list(policy_hash.encode('utf-8'))}
                        ],
                        "commands": [{
                            "MoveCall": {
                                "package": settings.sui_package_id,
                                "module": "vector_index", 
                                "function": "add_embedding",
                                "arguments": ["Input(0)", "Input(1)", "Input(2)", "Input(3)", "Input(4)", "Input(5)"]
                            }
                        }]
                    }
                },
                "sender": user_address,
                "gasBudget": "10000000"
            }])
            
            if "error" in result:
                print(f"Failed to add embedding: {result['error']}")
                return None
                
            # Return a mock embedding ID for now
            return f"embedding_{user_address}_{category}_{len(metadata_vector)}"
            
        except Exception as e:
            print(f"Error adding embedding: {e}")
            return None

    async def finalize_update(self, user_id: str, vector_cert: str, graph_cert: str) -> Dict[str, Any]:
        """Call the memory_wallet::finalize_update function"""
        try:
            memory_object_id = await self.get_or_create_memory_object(user_id)
            if not memory_object_id:
                return {"success": False, "error": "No memory object found"}
            
            result = await self.call_rpc("sui_executeTransactionBlock", [{
                "transaction_kind": {
                    "ProgrammableTransaction": {
                        "inputs": [
                            {"type": "object", "objectId": memory_object_id},
                            {"type": "pure", "valueType": "vector<u8>", "value": list(vector_cert.encode('utf-8'))},
                            {"type": "pure", "valueType": "vector<u8>", "value": list(graph_cert.encode('utf-8'))},
                            {"type": "object", "objectId": settings.memory_wallet_admin_cap}
                        ],
                        "commands": [{
                            "MoveCall": {
                                "package": settings.sui_package_id,
                                "module": "memory_wallet",
                                "function": "finalize_update",
                                "arguments": ["Input(0)", "Input(1)", "Input(2)", "Input(3)"]
                            }
                        }]
                    }
                },
                "sender": user_id,
                "gasBudget": "10000000"
            }])
            
            if "error" in result:
                return {"success": False, "error": result["error"]}
                
            return {"success": True, "transaction_digest": result.get("result", {}).get("digest", "unknown")}
            
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def get_memory_object(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Query the user's MemoryObject from Sui"""
        try:
            # In a real implementation, we'd query for objects owned by the user
            # For now, return a basic structure
            return {
                "user_id": user_id,
                "vector_index_cert": "",
                "graph_cert": "",
                "last_updated": "2024-01-01T00:00:00Z"
            }
        except Exception as e:
            print(f"Error getting memory object: {e}")
            return None

    async def query_embeddings(self, user_address: str, query_vector: list, k: int = 5) -> list:
        """Query embeddings from the vector index for similarity search"""
        try:
            # In a real implementation, this would query the vector index contract
            # For now, return an empty list
            return []
        except Exception as e:
            print(f"Error querying embeddings: {e}")
            return []

    async def close(self):
        await self.client.aclose()