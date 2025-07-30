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
            # Generate session ID
            session_id = f"{user_address}_{int(datetime.now().timestamp() * 1000)}"
            
            # For now, simulate Sui transaction
            # In production, this would call the actual Sui smart contract
            session_data = {
                "id": session_id,
                "owner": user_address,
                "title": title,
                "messages": [],
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat(),
                "message_count": 0,
                "sui_object_id": f"0x{uuid.uuid4().hex}"  # Simulated object ID
            }
            
            # Store in simulated storage
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
            # For now, filter simulated sessions
            # In production, this would query Sui for user's session objects
            user_sessions = []
            for session_id, session_data in self.simulated_sessions.items():
                if session_data["owner"] == user_address:
                    user_sessions.append(session_data)
            
            # Sort by updated_at descending
            user_sessions.sort(key=lambda x: x["updated_at"], reverse=True)
            
            logger.debug(f"Found {len(user_sessions)} sessions for user {user_address}")
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
                return False
            
            # Create message
            message_id = f"msg_{uuid.uuid4().hex[:8]}"
            message = {
                "id": message_id,
                "content": message_content,
                "type": message_type,
                "timestamp": datetime.now().isoformat()
            }
            
            # Add to session
            session_data["messages"].append(message)
            session_data["message_count"] = len(session_data["messages"])
            session_data["updated_at"] = datetime.now().isoformat()
            
            # Update title if this is the first user message
            if message_type == "user" and session_data["message_count"] == 1:
                # Generate title from first message
                title = self._generate_title_from_message(message_content)
                session_data["title"] = title
            
            # Store updated session
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
