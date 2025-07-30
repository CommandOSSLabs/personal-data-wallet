import numpy as np
from sentence_transformers import SentenceTransformer
from typing import List, Union, Dict, Tuple, Optional
import logging
import json
import hashlib
from datetime import datetime

logger = logging.getLogger(__name__)

class AdvancedEmbeddingService:
    def __init__(self, 
                 main_model_name: str = "all-MiniLM-L6-v2",
                 metadata_model_name: str = "all-MiniLM-L6-v2"):
        """
        Initialize the advanced embedding service with separate models for main data and metadata.
        
        Args:
            main_model_name: Model for main content embeddings
            metadata_model_name: Model for metadata embeddings (can be same as main)
        """
        try:
            # Load main content model
            self.main_model = SentenceTransformer(main_model_name)
            self.main_model_name = main_model_name
            self.main_embedding_dim = self.main_model.get_sentence_embedding_dimension()
            
            # Load metadata model (can be same instance if same model)
            if metadata_model_name == main_model_name:
                self.metadata_model = self.main_model
            else:
                self.metadata_model = SentenceTransformer(metadata_model_name)
            
            self.metadata_model_name = metadata_model_name
            self.metadata_embedding_dim = self.metadata_model.get_sentence_embedding_dimension()
            
            logger.info(f"Loaded embedding models - Main: {main_model_name} (dim: {self.main_embedding_dim}), "
                       f"Metadata: {metadata_model_name} (dim: {self.metadata_embedding_dim})")
        except Exception as e:
            logger.error(f"Failed to load embedding models: {e}")
            raise
    
    def encode_for_storage(self, 
                          text: str, 
                          category: str = "general",
                          user_id: str = None,
                          additional_metadata: Dict = None) -> Dict:
        """
        Encode text for secure storage with separate main and metadata vectors.
        
        Args:
            text: The main text content to embed
            category: Category for the memory (e.g., "personal", "work", "facts")
            user_id: User identifier
            additional_metadata: Additional metadata to include
            
        Returns:
            Dictionary containing main vector, metadata vector, and metadata
        """
        try:
            # Generate main content embedding (this will be encrypted)
            main_vector = self.main_model.encode([text], convert_to_numpy=True)[0]
            
            # Create metadata for searchability
            metadata = {
                "category": category,
                "text_length": len(text),
                "text_preview": text[:100] + "..." if len(text) > 100 else text,
                "timestamp": datetime.now().isoformat(),
                "user_id": user_id,
                "content_hash": hashlib.sha256(text.encode()).hexdigest()[:16],
                **(additional_metadata or {})
            }
            
            # Generate metadata embedding (this will be stored unencrypted for search)
            metadata_text = f"Category: {category}. Preview: {metadata['text_preview']}"
            metadata_vector = self.metadata_model.encode([metadata_text], convert_to_numpy=True)[0]
            
            return {
                "main_vector": main_vector.tolist(),  # Convert to list for JSON serialization
                "metadata_vector": metadata_vector.tolist(),
                "metadata": metadata,
                "main_vector_dim": len(main_vector),
                "metadata_vector_dim": len(metadata_vector)
            }
            
        except Exception as e:
            logger.error(f"Failed to encode text for storage: {e}")
            raise
    
    def encode_query(self, query_text: str) -> np.ndarray:
        """
        Encode a query for searching against metadata vectors.
        
        Args:
            query_text: The search query
            
        Returns:
            Query vector for metadata search
        """
        try:
            query_vector = self.metadata_model.encode([query_text], convert_to_numpy=True)[0]
            logger.debug(f"Generated query vector for: {query_text[:50]}...")
            return query_vector
        except Exception as e:
            logger.error(f"Failed to encode query: {e}")
            raise
    
    def encode(self, texts: Union[str, List[str]], model_type: str = "main") -> np.ndarray:
        """
        Encode text(s) into embeddings using specified model.
        
        Args:
            texts: Single text string or list of text strings
            model_type: "main" or "metadata" to specify which model to use
            
        Returns:
            numpy array of embeddings
        """
        try:
            if isinstance(texts, str):
                texts = [texts]
            
            model = self.main_model if model_type == "main" else self.metadata_model
            embeddings = model.encode(texts, convert_to_numpy=True)
            logger.debug(f"Generated {model_type} embeddings for {len(texts)} texts")
            return embeddings
        except Exception as e:
            logger.error(f"Failed to generate embeddings: {e}")
            raise
    
    def encode_single(self, text: str, model_type: str = "main") -> np.ndarray:
        """
        Encode a single text into an embedding.
        
        Args:
            text: Text string to encode
            model_type: "main" or "metadata" to specify which model to use
            
        Returns:
            1D numpy array embedding
        """
        embeddings = self.encode([text], model_type)
        return embeddings[0]
    
    def similarity(self, embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        """
        Calculate cosine similarity between two embeddings.
        
        Args:
            embedding1: First embedding vector
            embedding2: Second embedding vector
            
        Returns:
            Cosine similarity score between -1 and 1
        """
        try:
            # Normalize vectors
            norm1 = np.linalg.norm(embedding1)
            norm2 = np.linalg.norm(embedding2)
            
            if norm1 == 0 or norm2 == 0:
                return 0.0
            
            # Calculate cosine similarity
            similarity = np.dot(embedding1, embedding2) / (norm1 * norm2)
            return float(similarity)
        except Exception as e:
            logger.error(f"Failed to calculate similarity: {e}")
            return 0.0
    
    def get_embedding_dimensions(self) -> Dict[str, int]:
        """Get the dimensions of embeddings produced by both models."""
        return {
            "main_embedding_dimension": self.main_embedding_dim,
            "metadata_embedding_dimension": self.metadata_embedding_dim
        }
    
    def get_model_info(self) -> Dict:
        """Get information about the loaded models."""
        return {
            "main_model_name": self.main_model_name,
            "metadata_model_name": self.metadata_model_name,
            "main_embedding_dimension": self.main_embedding_dim,
            "metadata_embedding_dimension": self.metadata_embedding_dim,
            "main_max_seq_length": getattr(self.main_model, 'max_seq_length', None),
            "metadata_max_seq_length": getattr(self.metadata_model, 'max_seq_length', None)
        }
    
    def prepare_for_encryption(self, encoded_data: Dict) -> Tuple[bytes, Dict]:
        """
        Prepare encoded data for encryption by separating main vector from metadata.
        
        Args:
            encoded_data: Output from encode_for_storage()
            
        Returns:
            Tuple of (main_vector_bytes, metadata_with_vector)
        """
        try:
            # Convert main vector to bytes for encryption
            main_vector_bytes = json.dumps(encoded_data["main_vector"]).encode('utf-8')
            
            # Prepare metadata with metadata vector for on-chain storage
            metadata_for_chain = {
                "metadata_vector": encoded_data["metadata_vector"],
                "metadata": encoded_data["metadata"],
                "main_vector_dim": encoded_data["main_vector_dim"],
                "metadata_vector_dim": encoded_data["metadata_vector_dim"]
            }
            
            return main_vector_bytes, metadata_for_chain
            
        except Exception as e:
            logger.error(f"Failed to prepare data for encryption: {e}")
            raise
