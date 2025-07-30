from typing import Dict, List, Optional, Any
from datetime import datetime
import json
from models import QuiltBlob, QuiltResponse


class MetadataManager:
    """
    Manages metadata for Walrus-Quilt operations with efficient querying capabilities
    """
    
    def __init__(self):
        self.metadata_store: Dict[str, Dict[str, Any]] = {}
    
    def create_embedding_metadata(
        self, 
        user_id: str, 
        embedding_count: int,
        model_name: str = "default",
        source: str = "unknown",
        custom_tags: Dict[str, str] = None
    ) -> Dict[str, str]:
        """Create standardized metadata for embedding storage"""
        
        base_metadata = {
            "type": "embedding",
            "user_id": user_id,
            "count": str(embedding_count),
            "model": model_name,
            "source": source,
            "created": datetime.now().isoformat(),
            "version": "1.0"
        }
        
        if custom_tags:
            base_metadata.update(custom_tags)
        
        return base_metadata
    
    def create_index_metadata(
        self,
        user_id: str,
        dimension: int,
        total_items: int,
        index_type: str = "hnsw",
        custom_tags: Dict[str, str] = None
    ) -> Dict[str, str]:
        """Create standardized metadata for index storage"""
        
        base_metadata = {
            "type": "vector_index",
            "user_id": user_id,
            "dimension": str(dimension),
            "total_items": str(total_items),
            "index_type": index_type,
            "created": datetime.now().isoformat(),
            "version": "1.0"
        }
        
        if custom_tags:
            base_metadata.update(custom_tags)
        
        return base_metadata
    
    def register_quilt(self, quilt_response: QuiltResponse, metadata: Dict[str, Any]):
        """Register quilt metadata for future querying"""
        
        quilt_metadata = {
            "quilt_id": quilt_response.quilt_id,
            "patch_count": len(quilt_response.patches),
            "total_cost": quilt_response.total_cost,
            "created": datetime.now().isoformat(),
            "patches": [
                {
                    "patch_id": patch.patch_id,
                    "identifier": patch.identifier,
                    "size": patch.size
                }
                for patch in quilt_response.patches
            ]
        }
        quilt_metadata.update(metadata)
        
        self.metadata_store[quilt_response.quilt_id] = quilt_metadata
    
    def query_quilts(
        self, 
        user_id: Optional[str] = None,
        data_type: Optional[str] = None,
        category: Optional[str] = None,
        custom_filters: Dict[str, str] = None
    ) -> List[Dict[str, Any]]:
        """Query quilts by metadata filters"""
        
        results = []
        
        for quilt_id, metadata in self.metadata_store.items():
            # Apply filters
            if user_id and metadata.get("user_id") != user_id:
                continue
            
            if data_type and metadata.get("type") != data_type:
                continue
            
            if category and metadata.get("category") != category:
                continue
            
            # Apply custom filters
            if custom_filters:
                skip = False
                for key, value in custom_filters.items():
                    if metadata.get(key) != value:
                        skip = True
                        break
                if skip:
                    continue
            
            results.append(metadata)
        
        # Sort by creation time (newest first)
        results.sort(key=lambda x: x.get("created", ""), reverse=True)
        return results


class QuiltMetadataBuilder:
    """
    Builder pattern for creating complex metadata configurations
    """
    
    def __init__(self):
        self.metadata = {}
        self.common_tags = {}
    
    def user(self, user_id: str):
        """Set user ID"""
        self.metadata["user_id"] = user_id
        return self
    
    def type(self, data_type: str):
        """Set data type"""
        self.metadata["type"] = data_type
        return self
    
    def category(self, category: str):
        """Set category"""
        self.metadata["category"] = category
        return self
    
    def build(self) -> Dict[str, str]:
        """Build the metadata dictionary"""
        final_metadata = self.metadata.copy()
        final_metadata["created"] = datetime.now().isoformat()
        final_metadata["version"] = "1.0"
        return final_metadata