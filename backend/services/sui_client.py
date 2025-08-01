import httpx
import json
import time
from typing import Dict, Any, Optional, List
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
            # Ensure consistent serialization
            payload_str = json.dumps(payload, separators=(',', ':'), sort_keys=True)
            
            # Add debug information for key chat persistence operations
            debug_methods = ["sui_getOwnedObjects", "sui_executeTransactionBlock", "create_session", "get_user_sessions"]
            if any(debug_term in method for debug_term in debug_methods):
                print(f"DEBUG Sui RPC call: {method}")
                print(f"Request params (truncated): {str(params)[:100]}...")
            
            response = await self.client.post(
                self.rpc_url,
                content=payload_str,  
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            result = response.json()
            
            # Log errors for important calls
            if "error" in result and any(debug_term in method for debug_term in debug_methods):
                print(f"Sui RPC ERROR for {method}: {result['error']}")
                
            return result
        except Exception as e:
            print(f"Sui RPC call failed for {method}: {e}")
            # Add more context to the error
            if isinstance(e, httpx.TimeoutException):
                return {"error": f"Timeout while calling {method}: {str(e)}"}
            elif isinstance(e, httpx.HTTPStatusError):
                return {"error": f"HTTP error {e.response.status_code} while calling {method}: {str(e)}"}
            else:
                return {"error": f"Error while calling {method}: {str(e)}"}

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
            # First try to get an existing memory object
            existing_object = await self.get_memory_object(user_id)
            if existing_object and 'object_id' in existing_object:
                print(f"Found existing memory object: {existing_object['object_id']}")
                return existing_object['object_id']
            
            # Create a new memory object if one doesn't exist
            print(f"Creating new memory object for user: {user_id}")
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
            try:
                if "result" in result and "effects" in result["result"]:
                    created_objects = result["result"]["effects"]["created"]
                    for obj in created_objects:
                        if obj.get("owner", {}).get("AddressOwner") == user_id:
                            print(f"Created new memory object: {obj['reference']['objectId']}")
                            return obj['reference']['objectId']
            except Exception as e:
                print(f"Failed to parse transaction result: {e}")
            
            # Fallback if we can't parse the transaction result
            print("Using temporary object ID until next transaction confirms")
            return f"memory_object_{user_id[:10]}"
            
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
            # Query objects owned by user
            result = await self.call_rpc("sui_getOwnedObjects", [
                user_id,
                {
                    "filter": {
                        "MatchAll": [
                            {"StructType": f"{settings.sui_package_id}::memory_wallet::MemoryObject"}
                        ]
                    },
                    "options": {
                        "showType": True,
                        "showOwner": True,
                        "showPreviousTransaction": True,
                        "showContent": True
                    }
                },
                None,  # Cursor for pagination (None for first page)
                10     # Limit to 10 objects
            ])
            
            if "error" in result:
                print(f"Failed to get memory objects: {result['error']}")
                return None
                
            if "result" in result and "data" in result["result"]:
                objects = result["result"]["data"]
                if objects and len(objects) > 0:
                    obj = objects[0]  # Take the first memory object found
                    object_id = obj["data"]["objectId"]
                    content = obj["data"]["content"]
                    
                    return {
                        "object_id": object_id,
                        "user_id": user_id,
                        "vector_index_cert": content.get("fields", {}).get("vector_index_cert", ""),
                        "graph_cert": content.get("fields", {}).get("graph_cert", ""),
                        "last_updated": obj["data"].get("previousTransaction", "unknown")
                    }
            
            # No memory object found
            return None
        except Exception as e:
            print(f"Error getting memory object: {e}")
            return None

    async def query_embeddings(self, user_address: str, query_vector: list, k: int = 5) -> list:
        """Query embeddings from the vector index contract for similarity search"""
        try:
            # Scale and limit the query vector for Sui (same as in add_embedding)
            query_vector_u64 = [int(x * 1000000) for x in query_vector[:64]]
            
            result = await self.call_rpc("sui_devInspectTransactionBlock", [
                user_address,  # Sender address
                {
                    "kind": "ProgrammableTransaction",
                    "inputs": [
                        {"type": "object", "objectId": settings.vector_registry_id},
                        {"type": "pure", "valueType": "vector<u64>", "value": query_vector_u64},
                        {"type": "pure", "valueType": "u64", "value": k}
                    ],
                    "transactions": [{
                        "MoveCall": {
                            "package": settings.sui_package_id,
                            "module": "vector_index",
                            "function": "query_top_k",
                            "typeArguments": [],
                            "arguments": ["Input(0)", "Input(1)", "Input(2)"]
                        }
                    }]
                }
            ])
            
            if "error" in result:
                print(f"Failed to query embeddings: {result['error']}")
                return []
            
            # Parse the result - in a real implementation, this would extract the returned embeddings
            # The structure depends on your Move contract's return format
            try:
                if "result" in result and "results" in result["result"]:
                    # Extract the return value from the transaction result
                    return_value = result["result"]["results"][0]["returnValues"]
                    if return_value and len(return_value) > 0:
                        # Parse the vector of embeddings
                        embeddings = []
                        for embedding_data in return_value[0]:
                            embeddings.append({
                                "walrus_hash": embedding_data.get("walrus_hash", ""),
                                "similarity": embedding_data.get("similarity", 0),
                                "category": embedding_data.get("category", "unknown"),
                                "ibe_identity": embedding_data.get("ibe_identity", "")
                            })
                        return embeddings
            except Exception as e:
                print(f"Failed to parse query results: {e}")
            
            return []
        except Exception as e:
            print(f"Error querying embeddings: {e}")
            return []

    async def create_chat_session(self, user_address: str, title: str) -> Dict[str, Any]:
        """Create a new chat session on Sui blockchain"""
        try:
            print(f"Creating chat session for user {user_address}: {title}")
            
            # Generate a unique session ID
            session_id = f"{user_address}_{int(time.time() * 1000)}"
            
            # Call the chat_sessions::create_session function
            result = await self.call_rpc("sui_executeTransactionBlock", [{
                "transaction_kind": {
                    "ProgrammableTransaction": {
                        "inputs": [
                            {"type": "object", "objectId": settings.chat_session_registry_id},
                            {"type": "pure", "valueType": "vector<u8>", "value": list(session_id.encode('utf-8'))},
                            {"type": "pure", "valueType": "vector<u8>", "value": list(title.encode('utf-8'))}
                        ],
                        "commands": [{
                            "MoveCall": {
                                "package": settings.sui_package_id,
                                "module": "chat_sessions",
                                "function": "create_session",
                                "arguments": ["Input(0)", "Input(1)", "Input(2)"]
                            }
                        }]
                    }
                },
                "sender": user_address,
                "gasBudget": "10000000"
            }])
            
            if "error" in result:
                print(f"Failed to create chat session: {result['error']}")
                return {"success": False, "error": result["error"], "session_id": session_id}
            
            return {
                "success": True,
                "session_id": session_id,
                "title": title,
                "created_at": int(time.time()),
                "transaction_digest": result.get("result", {}).get("digest", "unknown")
            }
            
        except Exception as e:
            print(f"Error creating chat session: {e}")
            return {"success": False, "error": str(e), "session_id": None}
    
    async def add_message_to_session(self, user_address: str, session_id: str, 
                                   role: str, content: str, timestamp: int) -> Dict[str, Any]:
        """Add a message to an existing chat session on Sui blockchain"""
        try:
            print(f"Adding message to session {session_id} for user {user_address}")
            
            # Call the chat_sessions::add_message function
            result = await self.call_rpc("sui_executeTransactionBlock", [{
                "transaction_kind": {
                    "ProgrammableTransaction": {
                        "inputs": [
                            {"type": "object", "objectId": settings.chat_session_registry_id},
                            {"type": "pure", "valueType": "vector<u8>", "value": list(session_id.encode('utf-8'))},
                            {"type": "pure", "valueType": "vector<u8>", "value": list(role.encode('utf-8'))},
                            {"type": "pure", "valueType": "vector<u8>", "value": list(content.encode('utf-8'))},
                            {"type": "pure", "valueType": "u64", "value": timestamp}
                        ],
                        "commands": [{
                            "MoveCall": {
                                "package": settings.sui_package_id,
                                "module": "chat_sessions",
                                "function": "add_message",
                                "arguments": ["Input(0)", "Input(1)", "Input(2)", "Input(3)", "Input(4)"]
                            }
                        }]
                    }
                },
                "sender": user_address,
                "gasBudget": "10000000"
            }])
            
            if "error" in result:
                print(f"Failed to add message to chat session: {result['error']}")
                return {"success": False, "error": result["error"]}
            
            return {
                "success": True,
                "session_id": session_id,
                "transaction_digest": result.get("result", {}).get("digest", "unknown")
            }
            
        except Exception as e:
            print(f"Error adding message to chat session: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_user_sessions(self, user_address: str) -> List[Dict[str, Any]]:
        """Get all chat sessions for a specific user from Sui blockchain"""
        try:
            # Call the chat_sessions::get_user_sessions view function
            result = await self.call_rpc("sui_devInspectTransactionBlock", [
                user_address,
                {
                    "kind": "ProgrammableTransaction",
                    "inputs": [
                        {"type": "object", "objectId": settings.chat_session_registry_id},
                        {"type": "pure", "valueType": "address", "value": user_address}
                    ],
                    "transactions": [{
                        "MoveCall": {
                            "package": settings.sui_package_id,
                            "module": "chat_sessions",
                            "function": "get_user_sessions",
                            "typeArguments": [],
                            "arguments": ["Input(0)", "Input(1)"]
                        }
                    }]
                }
            ])
            
            if "error" in result:
                print(f"Failed to get user sessions: {result['error']}")
                return []
            
            sessions = []
            try:
                if "result" in result and "results" in result["result"]:
                    # Extract sessions from the return value
                    return_value = result["result"]["results"][0]["returnValues"]
                    if return_value and len(return_value) > 0:
                        for session_data in return_value[0]:
                            sessions.append({
                                "session_id": session_data.get("session_id", ""),
                                "title": session_data.get("title", "Untitled Session"),
                                "created_at": session_data.get("created_at", 0),
                                "message_count": session_data.get("message_count", 0)
                            })
            except Exception as e:
                print(f"Failed to parse sessions: {e}")
            
            return sessions
            
        except Exception as e:
            print(f"Error getting user sessions: {e}")
            return []
    
    async def close(self):
        await self.client.aclose()