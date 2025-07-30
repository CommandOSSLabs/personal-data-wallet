import json
import os
from typing import List, Optional, Dict, Any
from datetime import datetime
from models import MemoryItem, MemoryType

class MemoryStorage:
    def __init__(self, data_dir: str = "data"):
        self.data_dir = data_dir
        self.memories_dir = os.path.join(data_dir, "memories")
        os.makedirs(self.memories_dir, exist_ok=True)

    def _get_user_memories_file(self, user_id: str) -> str:
        return os.path.join(self.memories_dir, f"{user_id}_memories.json")

    def _load_user_memories(self, user_id: str) -> Dict[str, Any]:
        """Load all memories for a user from file"""
        file_path = self._get_user_memories_file(user_id)
        if not os.path.exists(file_path):
            return {"memories": {}, "metadata": {"last_updated": datetime.now().isoformat()}}
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading memories for user {user_id}: {e}")
            return {"memories": {}, "metadata": {"last_updated": datetime.now().isoformat()}}

    def _save_user_memories(self, user_id: str, data: Dict[str, Any]) -> bool:
        """Save all memories for a user to file"""
        try:
            file_path = self._get_user_memories_file(user_id)
            data["metadata"]["last_updated"] = datetime.now().isoformat()
            
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False, default=str)
            return True
        except Exception as e:
            print(f"Error saving memories for user {user_id}: {e}")
            return False

    def _categorize_content(self, content: str, raw_text: str) -> str:
        """Automatically categorize content based on keywords and patterns"""
        content_lower = content.lower()
        raw_lower = raw_text.lower()
        combined = f"{content_lower} {raw_lower}"
        
        # Personal information
        if any(keyword in combined for keyword in ['my name', 'i am', 'i\'m', 'name is', 'birthday', 'born', 'age']):
            return 'personal'
        
        # Work/Professional
        if any(keyword in combined for keyword in ['work', 'job', 'company', 'office', 'career', 'employer', 'colleague']):
            return 'work'
        
        # Preferences
        if any(keyword in combined for keyword in ['like', 'prefer', 'favorite', 'love', 'hate', 'enjoy', 'dislike']):
            return 'preferences'
        
        # Schedule/Events
        if any(keyword in combined for keyword in ['meeting', 'appointment', 'schedule', 'event', 'calendar', 'deadline', 'date', 'time']):
            return 'schedule'
        
        # Contacts/People
        if any(keyword in combined for keyword in ['friend', 'family', 'phone', 'email', 'address', 'contact']):
            return 'contacts'
        
        # Health
        if any(keyword in combined for keyword in ['doctor', 'medicine', 'health', 'hospital', 'sick', 'pain', 'treatment']):
            return 'health'
        
        # Travel
        if any(keyword in combined for keyword in ['flight', 'hotel', 'travel', 'trip', 'vacation', 'airport', 'destination']):
            return 'travel'
        
        # Finance
        if any(keyword in combined for keyword in ['money', 'bank', 'payment', 'budget', 'salary', 'expense', 'investment']):
            return 'finance'
        
        # Default category
        return 'general'

    def create_memory(self, user_id: str, content: str, raw_text: str, 
                     memory_type: MemoryType = MemoryType.FACT,
                     category: Optional[str] = None,
                     related_session_id: Optional[str] = None,
                     metadata: Dict[str, Any] = None) -> MemoryItem:
        """Create a new memory item"""
        memory_id = f"{user_id}_{int(datetime.now().timestamp() * 1000)}"
        now = datetime.now()
        
        # Auto-categorize if no category provided
        if not category:
            category = self._categorize_content(content, raw_text)
        
        memory = MemoryItem(
            id=memory_id,
            user_id=user_id,
            content=content,
            raw_text=raw_text,
            type=memory_type,
            category=category,
            created_at=now,
            related_sessions=[related_session_id] if related_session_id else [],
            metadata=metadata or {}
        )
        
        # Load user data
        user_data = self._load_user_memories(user_id)
        user_data["memories"][memory_id] = memory.dict()
        
        # Save back
        if self._save_user_memories(user_id, user_data):
            return memory
        else:
            raise Exception("Failed to save memory")

    def get_memory(self, user_id: str, memory_id: str) -> Optional[MemoryItem]:
        """Get a specific memory item"""
        user_data = self._load_user_memories(user_id)
        memory_data = user_data["memories"].get(memory_id)
        
        if not memory_data:
            return None
        
        # Convert datetime strings back to datetime objects
        memory_data["created_at"] = datetime.fromisoformat(memory_data["created_at"])
        
        return MemoryItem(**memory_data)

    def get_user_memories(self, user_id: str, category: Optional[str] = None, 
                         memory_type: Optional[MemoryType] = None) -> List[MemoryItem]:
        """Get all memories for a user, optionally filtered by category or type"""
        user_data = self._load_user_memories(user_id)
        memories = []
        
        for memory_data in user_data["memories"].values():
            # Convert datetime strings back to datetime objects
            memory_data["created_at"] = datetime.fromisoformat(memory_data["created_at"])
            memory = MemoryItem(**memory_data)
            
            # Apply filters
            if category and memory.category != category:
                continue
            if memory_type and memory.type != memory_type:
                continue
            
            memories.append(memory)
        
        # Sort by created_at descending (most recent first)
        memories.sort(key=lambda x: x.created_at, reverse=True)
        return memories

    def get_memories_by_category(self, user_id: str) -> Dict[str, List[MemoryItem]]:
        """Get all memories grouped by category"""
        memories = self.get_user_memories(user_id)
        categories = {}
        
        for memory in memories:
            if memory.category not in categories:
                categories[memory.category] = []
            categories[memory.category].append(memory)
        
        return categories

    def search_memories(self, user_id: str, query: str) -> List[MemoryItem]:
        """Search memories by content"""
        memories = self.get_user_memories(user_id)
        query_lower = query.lower()
        
        matching_memories = []
        for memory in memories:
            if (query_lower in memory.content.lower() or 
                query_lower in memory.raw_text.lower()):
                matching_memories.append(memory)
        
        return matching_memories

    def delete_memory(self, user_id: str, memory_id: str) -> bool:
        """Delete a memory item"""
        user_data = self._load_user_memories(user_id)
        
        if memory_id in user_data["memories"]:
            del user_data["memories"][memory_id]
            return self._save_user_memories(user_id, user_data)
        
        return False

    def clear_user_memories(self, user_id: str, category: Optional[str] = None) -> bool:
        """Clear all memories for a user, optionally filtered by category"""
        user_data = self._load_user_memories(user_id)
        
        if category:
            # Delete only memories from specific category
            memories_to_delete = []
            for memory_id, memory_data in user_data["memories"].items():
                if memory_data.get("category") == category:
                    memories_to_delete.append(memory_id)
            
            for memory_id in memories_to_delete:
                del user_data["memories"][memory_id]
        else:
            # Clear all memories
            user_data["memories"] = {}
        
        return self._save_user_memories(user_id, user_data)

    def update_memory(self, user_id: str, memory_id: str, 
                     content: Optional[str] = None,
                     category: Optional[str] = None,
                     metadata: Optional[Dict[str, Any]] = None) -> bool:
        """Update a memory item"""
        user_data = self._load_user_memories(user_id)
        
        if memory_id not in user_data["memories"]:
            return False
        
        memory_data = user_data["memories"][memory_id]
        
        if content is not None:
            memory_data["content"] = content
        if category is not None:
            memory_data["category"] = category
        if metadata is not None:
            memory_data["metadata"].update(metadata)
        
        return self._save_user_memories(user_id, user_data)

    def get_user_stats(self, user_id: str) -> Dict[str, Any]:
        """Get statistics about user's memories"""
        memories = self.get_user_memories(user_id)
        categories = self.get_memories_by_category(user_id)
        
        type_counts = {}
        for memory in memories:
            type_counts[memory.type] = type_counts.get(memory.type, 0) + 1
        
        return {
            "total_memories": len(memories),
            "categories": list(categories.keys()),
            "category_counts": {cat: len(items) for cat, items in categories.items()},
            "type_counts": type_counts,
            "last_updated": datetime.now().isoformat()
        }