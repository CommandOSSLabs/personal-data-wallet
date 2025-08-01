import asyncio
import json
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
import uuid

from services.sui_client import SuiClient

logger = logging.getLogger(__name__)

class SuiChatSessionsService:
    """
    Service for managing chat sessions on Sui blockchain.
    Provides decentralized storage for chat history.
    """
    
    def __init__(self):
        self.sui_client = SuiClient()
        
        # For development, we'll simulate some functionality
        # In production, these would be actual Sui RPC calls
        self.simulated_sessions: Dict[str, Dict] = {}
        
        logger.info("Initialized Sui chat sessions service")
    
    async def create_session(self, 
                           user_address: str, 
                           title: str = "New Chat",
                           user_signature: str = None) -> Dict:
        """
        Create a new chat session on Sui blockchain.
        
        Args:
            user_address: User's Sui address
            title: Session title
            user_signature: User's signature for authentication
            
        Returns:
            Dictionary containing session information
        """
        try:
            # Create session on Sui blockchain
            result = await self.sui_client.create_chat_session(
                user_address=user_address,
                title=title
            )
            
            if not result.get("success", False):
                logger.error(f"Failed to create chat session on Sui: {result.get('error', 'unknown error')}")
                # Fall back to simulated storage
                logger.info("Falling back to simulated storage")
                session_id = result.get("session_id") or f"{user_address}_{int(datetime.now().timestamp() * 1000)}"
                session_data = {
                    "id": session_id,
                    "owner": user_address,
                    "title": title,
                    "messages": [],
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat(),
                    "message_count": 0,
                    "sui_object_id": None,  # No Sui object ID for simulated sessions
                    "storage_type": "simulated"
                }
            else:
                # Use the session data from Sui blockchain
                session_id = result["session_id"]
                session_data = {
                    "id": session_id,
                    "owner": user_address,
                    "title": title,
                    "messages": [],
                    "created_at": datetime.fromtimestamp(result.get("created_at", datetime.now().timestamp())).isoformat(),
                    "updated_at": datetime.now().isoformat(),
                    "message_count": 0,
                    "sui_object_id": result.get("transaction_digest"),
                    "storage_type": "sui_blockchain"
                }
            
            # Always store in local cache for quick access
            self.simulated_sessions[session_id] = session_data
            
            logger.info(f"Created chat session: {session_id}")
            return session_data
            
        except Exception as e:
            logger.error(f"Failed to create session: {e}")
            raise
    
    async def get_user_sessions(self, user_address: str) -> List[Dict]:
        """
        Get all chat sessions for a user.
        
        Args:
            user_address: User's Sui address
            
        Returns:
            List of session dictionaries
        """
        try:
            # Try to get sessions from Sui blockchain first
            blockchain_sessions = await self.sui_client.get_user_sessions(user_address)
            
            if blockchain_sessions:
                logger.info(f"Retrieved {len(blockchain_sessions)} sessions from Sui blockchain for user {user_address}")
                
                # Convert blockchain sessions to our format
                user_sessions = []
                for session in blockchain_sessions:
                    session_id = session.get("session_id")
                    
                    # Check if we have this session in our cache
                    if session_id in self.simulated_sessions:
                        # Use cached session with messages
                        cached_session = self.simulated_sessions[session_id]
                        
                        # Update with latest blockchain data
                        cached_session["message_count"] = session.get("message_count", cached_session["message_count"])
                        cached_session["storage_type"] = "sui_blockchain"
                        
                        user_sessions.append(cached_session)
                    else:
                        # Create new session object from blockchain data
                        timestamp = session.get("created_at", int(datetime.now().timestamp()))
                        created_at = datetime.fromtimestamp(timestamp).isoformat() if isinstance(timestamp, int) else timestamp
                        
                        new_session = {
                            "id": session_id,
                            "owner": user_address,
                            "title": session.get("title", "Chat Session"),
                            "messages": [],  # Messages will be loaded on demand
                            "created_at": created_at,
                            "updated_at": created_at,
                            "message_count": session.get("message_count", 0),
                            "sui_object_id": session_id,
                            "storage_type": "sui_blockchain"
                        }
                        
                        self.simulated_sessions[session_id] = new_session
                        user_sessions.append(new_session)
                
                # Sort by updated_at descending
                user_sessions.sort(key=lambda x: x["updated_at"], reverse=True)
                return user_sessions
            else:
                # Fall back to local sessions
                logger.info(f"No blockchain sessions found, checking local cache for user {user_address}")
                user_sessions = []
                for session_id, session_data in self.simulated_sessions.items():
                    if session_data["owner"] == user_address:
                        user_sessions.append(session_data)
                
                # If no cached sessions, try to recover from file storage
                if not user_sessions:
                    logger.warning(f"No local cache sessions found, trying to recover from file storage for user {user_address}")
                    try:
                        # Import inside function to avoid circular imports
                        from services.chat_storage import ChatStorage
                        chat_storage = ChatStorage()
                        stored_sessions = chat_storage.get_user_sessions(user_address)
                        
                        if stored_sessions:
                            logger.info(f"Recovered {len(stored_sessions)} sessions from file storage for user {user_address}")
                            
                            # Convert the file storage format to our format
                            for session in stored_sessions:
                                # Create a unique session ID if not present
                                session_id = getattr(session, 'id', f"{user_address}_{int(datetime.now().timestamp() * 1000)}")
                                
                                # Convert messages to dict format
                                message_list = []
                                try:
                                    if hasattr(session, 'messages'):
                                        if hasattr(session.messages[0], 'dict'):
                                            message_list = [msg.dict() for msg in session.messages]
                                        else:
                                            message_list = session.messages
                                except (IndexError, AttributeError):
                                    logger.warning(f"Could not convert messages for session {session_id}")
                                
                                # Create timestamps
                                created_at = getattr(session, 'created_at', datetime.now()).isoformat() 
                                updated_at = getattr(session, 'updated_at', datetime.now()).isoformat()
                                
                                # Create a session data structure 
                                session_data = {
                                    "id": session_id,
                                    "owner": user_address,
                                    "title": getattr(session, 'title', "Recovered Chat"),
                                    "messages": message_list,
                                    "created_at": created_at,
                                    "updated_at": updated_at,
                                    "message_count": len(message_list),
                                    "storage_type": "local_file"
                                }
                                
                                # Add to cache and return list
                                self.simulated_sessions[session_id] = session_data
                                user_sessions.append(session_data)
                    except Exception as storage_error:
                        logger.error(f"Failed to recover from file storage: {storage_error}")
                
                # Sort by updated_at descending
                user_sessions.sort(key=lambda x: x["updated_at"], reverse=True)
                return user_sessions
            
        except Exception as e:
            logger.error(f"Failed to get user sessions: {e}")
            return []
    
    async def get_session(self, session_id: str, user_address: str) -> Optional[Dict]:
        """
        Get a specific chat session.
        
        Args:
            session_id: Session identifier
            user_address: User's Sui address for ownership verification
            
        Returns:
            Session dictionary or None if not found
        """
        try:
            # For now, get from simulated storage
            # In production, this would query Sui object by ID
            session_data = self.simulated_sessions.get(session_id)
            
            if not session_data:
                logger.warning(f"Session not found: {session_id}")
                return None
            
            # Verify ownership
            if session_data["owner"] != user_address:
                logger.warning(f"Access denied to session {session_id} for user {user_address}")
                return None
            
            return session_data
            
        except Exception as e:
            logger.error(f"Failed to get session: {e}")
            return None
    
    async def add_message(self, 
                         session_id: str,
                         user_address: str,
                         message_content: str,
                         message_type: str,
                         user_signature: str = None) -> bool:
        """
        Add a message to a chat session.
        
        Args:
            session_id: Session identifier
            user_address: User's Sui address
            message_content: Message content
            message_type: "user" or "assistant"
            user_signature: User's signature for authentication
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Get session
            session_data = await self.get_session(session_id, user_address)
            if not session_data:
                logger.warning(f"Session {session_id} not found, creating it automatically")
                session_data = await self.create_session(user_address, "New Chat")
                session_id = session_data["id"]
                
            # Current timestamp
            timestamp = int(datetime.now().timestamp())
            message_id = f"msg_{timestamp}_{uuid.uuid4().hex[:6]}"
            
            # Create message locally
            message = {
                "id": message_id,
                "content": message_content,
                "type": message_type,
                "timestamp": datetime.now().isoformat()
            }
            
            # Try to add message to blockchain if this is a blockchain-stored session
            if session_data.get("storage_type") == "sui_blockchain":
                result = await self.sui_client.add_message_to_session(
                    user_address=user_address,
                    session_id=session_id,
                    role=message_type,
                    content=message_content,
                    timestamp=timestamp
                )
                
                if not result.get("success", False):
                    logger.warning(f"Failed to add message to blockchain: {result.get('error', 'unknown error')}")
                    # Continue with local storage
                else:
                    logger.info(f"Message added to blockchain session: {session_id}")
                    message["blockchain_tx"] = result.get("transaction_digest")
            
            # Always add to local cache
            session_data["messages"].append(message)
            session_data["message_count"] = len(session_data["messages"])
            session_data["updated_at"] = datetime.now().isoformat()
            
            # Update title if this is the first user message
            if message_type == "user" and session_data["message_count"] == 1:
                # Generate title from first message
                title = self._generate_title_from_message(message_content)
                session_data["title"] = title
            
            # Update local cache
            self.simulated_sessions[session_id] = session_data
            
            logger.debug(f"Added message to session {session_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to add message: {e}")
            return False
    
    async def update_session_title(self, 
                                 session_id: str,
                                 user_address: str,
                                 new_title: str,
                                 user_signature: str = None) -> bool:
        """
        Update a session's title.
        
        Args:
            session_id: Session identifier
            user_address: User's Sui address
            new_title: New title for the session
            user_signature: User's signature for authentication
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Get session
            session_data = await self.get_session(session_id, user_address)
            if not session_data:
                return False
            
            # Update title
            session_data["title"] = new_title
            session_data["updated_at"] = datetime.now().isoformat()
            
            # Store updated session
            self.simulated_sessions[session_id] = session_data
            
            logger.info(f"Updated title for session {session_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to update session title: {e}")
            return False
    
    async def delete_session(self, 
                           session_id: str,
                           user_address: str,
                           user_signature: str = None) -> bool:
        """
        Delete a chat session.
        
        Args:
            session_id: Session identifier
            user_address: User's Sui address
            user_signature: User's signature for authentication
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Get session to verify ownership
            session_data = await self.get_session(session_id, user_address)
            if not session_data:
                return False
            
            # Delete from simulated storage
            del self.simulated_sessions[session_id]
            
            logger.info(f"Deleted session {session_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete session: {e}")
            return False
    
    def _generate_title_from_message(self, message: str) -> str:
        """Generate a title from the first message."""
        # Simple title generation - take first 50 characters
        title = message.strip()
        if len(title) > 50:
            title = title[:47] + "..."
        return title or "New Chat"
    
    async def get_service_stats(self) -> Dict:
        """Get service statistics."""
        total_sessions = len(self.simulated_sessions)
        total_messages = sum(session["message_count"] for session in self.simulated_sessions.values())
        
        return {
            "total_sessions": total_sessions,
            "total_messages": total_messages,
            "active_users": len(set(session["owner"] for session in self.simulated_sessions.values())),
            "service_type": "simulated"  # Change to "production" when using real Sui
        }
    
    async def close(self):
        """Close the service and cleanup resources."""
        await self.sui_client.close()
        logger.info("Sui chat sessions service closed")
