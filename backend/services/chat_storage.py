import json
import os
from typing import List, Optional, Dict, Any
from datetime import datetime
from models import ChatSession, Message

class ChatStorage:
    def __init__(self, data_dir: str = "data"):
        self.data_dir = data_dir
        self.chats_dir = os.path.join(data_dir, "chats")
        os.makedirs(self.chats_dir, exist_ok=True)

    def _get_user_chats_file(self, user_id: str) -> str:
        return os.path.join(self.chats_dir, f"{user_id}_chats.json")

    def _load_user_chats(self, user_id: str) -> Dict[str, Any]:
        """Load all chats for a user from file"""
        file_path = self._get_user_chats_file(user_id)
        if not os.path.exists(file_path):
            return {"sessions": {}, "metadata": {"last_updated": datetime.now().isoformat()}}
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading chats for user {user_id}: {e}")
            return {"sessions": {}, "metadata": {"last_updated": datetime.now().isoformat()}}

    def _save_user_chats(self, user_id: str, data: Dict[str, Any]) -> bool:
        """Save all chats for a user to file"""
        try:
            file_path = self._get_user_chats_file(user_id)
            data["metadata"]["last_updated"] = datetime.now().isoformat()
            
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False, default=str)
            return True
        except Exception as e:
            print(f"Error saving chats for user {user_id}: {e}")
            return False

    def create_session(self, user_id: str, title: str = "New Chat") -> ChatSession:
        """Create a new chat session"""
        session_id = f"{user_id}_{int(datetime.now().timestamp() * 1000)}"
        now = datetime.now()
        
        session = ChatSession(
            id=session_id,
            user_id=user_id,
            title=title,
            messages=[],
            created_at=now,
            updated_at=now
        )
        
        # Load user data
        user_data = self._load_user_chats(user_id)
        user_data["sessions"][session_id] = session.dict()
        
        # Save back
        if self._save_user_chats(user_id, user_data):
            return session
        else:
            raise Exception("Failed to save chat session")

    def get_session(self, user_id: str, session_id: str) -> Optional[ChatSession]:
        """Get a specific chat session"""
        user_data = self._load_user_chats(user_id)
        session_data = user_data["sessions"].get(session_id)
        
        if not session_data:
            return None
        
        # Convert datetime strings back to datetime objects
        session_data["created_at"] = datetime.fromisoformat(session_data["created_at"])
        session_data["updated_at"] = datetime.fromisoformat(session_data["updated_at"])
        
        # Convert message timestamps
        for msg in session_data["messages"]:
            msg["timestamp"] = datetime.fromisoformat(msg["timestamp"])
        
        return ChatSession(**session_data)

    def get_user_sessions(self, user_id: str) -> List[ChatSession]:
        """Get all chat sessions for a user"""
        user_data = self._load_user_chats(user_id)
        sessions = []
        
        for session_data in user_data["sessions"].values():
            # Convert datetime strings back to datetime objects
            session_data["created_at"] = datetime.fromisoformat(session_data["created_at"])
            session_data["updated_at"] = datetime.fromisoformat(session_data["updated_at"])
            
            # Convert message timestamps
            for msg in session_data["messages"]:
                msg["timestamp"] = datetime.fromisoformat(msg["timestamp"])
            
            sessions.append(ChatSession(**session_data))
        
        # Sort by updated_at descending (most recent first)
        sessions.sort(key=lambda x: x.updated_at, reverse=True)
        return sessions

    def add_message(self, user_id: str, session_id: str, content: str, message_type: str) -> bool:
        """Add a message to a chat session"""
        user_data = self._load_user_chats(user_id)
        
        if session_id not in user_data["sessions"]:
            # Auto-create session if it doesn't exist
            print(f"Session {session_id} not found, creating it automatically")
            now = datetime.now()
            new_session = {
                "id": session_id,
                "user_id": user_id,
                "title": "New Chat",
                "messages": [],
                "created_at": now.isoformat(),
                "updated_at": now.isoformat()
            }
            user_data["sessions"][session_id] = new_session
        
        # Create new message
        message_id = f"{session_id}_{int(datetime.now().timestamp() * 1000)}"
        message = Message(
            id=message_id,
            content=content,
            type=message_type,
            timestamp=datetime.now()
        )
        
        # Add to session
        session_data = user_data["sessions"][session_id]
        session_data["messages"].append(message.dict())
        session_data["updated_at"] = datetime.now().isoformat()
        
        # Update title if it's the first user message
        if session_data["title"] == "New Chat" and message_type == "user":
            session_data["title"] = content[:50] + ("..." if len(content) > 50 else "")
        
        # Save back
        return self._save_user_chats(user_id, user_data)

    def delete_session(self, user_id: str, session_id: str) -> bool:
        """Delete a chat session"""
        user_data = self._load_user_chats(user_id)
        
        if session_id in user_data["sessions"]:
            del user_data["sessions"][session_id]
            return self._save_user_chats(user_id, user_data)
        
        return False

    def update_session_title(self, user_id: str, session_id: str, title: str) -> bool:
        """Update the title of a chat session"""
        user_data = self._load_user_chats(user_id)
        
        if session_id in user_data["sessions"]:
            user_data["sessions"][session_id]["title"] = title
            user_data["sessions"][session_id]["updated_at"] = datetime.now().isoformat()
            return self._save_user_chats(user_id, user_data)
        
        return False

    def get_user_stats(self, user_id: str) -> Dict[str, Any]:
        """Get statistics about user's chats"""
        user_data = self._load_user_chats(user_id)
        sessions = user_data["sessions"]
        
        total_messages = sum(len(session.get("messages", [])) for session in sessions.values())
        
        return {
            "total_sessions": len(sessions),
            "total_messages": total_messages,
            "last_updated": user_data["metadata"]["last_updated"]
        }