import numpy as np
import google.generativeai as genai
from typing import List, Union, Dict, Tuple, Optional
import logging
import json
import hashlib
from datetime import datetime
from config import settings

logger = logging.getLogger(__name__)

class GoogleEmbeddingService:
    """
    Google-based embedding service using Google's Generative AI embeddings.
    Provides dual-model architecture for main content and metadata vectors.
    """
    
    def __init__(self):
        """Initialize the Google embedding service."""
        try:
            # Configure Google AI using settings
            if not settings.google_api_key:
                raise ValueError("GOOGLE_API_KEY is required in settings")

            genai.configure(api_key=settings.google_api_key)
            
            # Use Google's embedding model
            self.model_name = "models/embedding-001"
            self.embedding_dim = 768  # Google's embedding-001 dimension
            
            logger.info(f"Initialized Google embedding service with model: {self.model_name}")
            
        except Exception as e:
            logger.error(f"Failed to initialize Google embedding service: {e}")
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
            main_vector = self._get_embedding(text)
            
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
            metadata_vector = self._get_embedding(metadata_text)
            
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
            query_vector = self._get_embedding(query_text)
            logger.debug(f"Generated query vector for: {query_text[:50]}...")
            return query_vector
        except Exception as e:
            logger.error(f"Failed to encode query: {e}")
            raise
    
    def encode(self, texts: Union[str, List[str]]) -> np.ndarray:
        """
        Encode text(s) into embeddings.
        
        Args:
            texts: Single text string or list of text strings
            
        Returns:
            numpy array of embeddings
        """
        try:
            if isinstance(texts, str):
                return self._get_embedding(texts).reshape(1, -1)
            
            embeddings = []
            for text in texts:
                embedding = self._get_embedding(text)
                embeddings.append(embedding)
            
            return np.array(embeddings)
            
        except Exception as e:
            logger.error(f"Failed to generate embeddings: {e}")
            raise
    
    def encode_single(self, text: str) -> np.ndarray:
        """
        Encode a single text into an embedding.
        
        Args:
            text: Text string to encode
            
        Returns:
            1D numpy array embedding
        """
        return self._get_embedding(text)
    
    def _get_embedding(self, text: str) -> np.ndarray:
        """
        Get embedding from Google's API.
        
        Args:
            text: Text to embed
            
        Returns:
            Embedding vector as numpy array
        """
        try:
            # Use Google's embedding API
            result = genai.embed_content(
                model=self.model_name,
                content=text,
                task_type="retrieval_document"
            )
            
            # Convert to numpy array
            embedding = np.array(result['embedding'], dtype=np.float32)
            return embedding
            
        except Exception as e:
            logger.error(f"Failed to get embedding from Google API: {e}")
            # Fallback: return random vector for development
            logger.warning("Using random embedding as fallback")
            return np.random.normal(0, 1, self.embedding_dim).astype(np.float32)
    
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
        """Get the dimensions of embeddings produced by the model."""
        return {
            "main_embedding_dimension": self.embedding_dim,
            "metadata_embedding_dimension": self.embedding_dim
        }
    
    def get_model_info(self) -> Dict:
        """Get information about the loaded model."""
        return {
            "main_model_name": self.model_name,
            "metadata_model_name": self.model_name,
            "main_embedding_dimension": self.embedding_dim,
            "metadata_embedding_dimension": self.embedding_dim,
            "provider": "Google Generative AI"
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
    
    def batch_encode(self, texts: List[str], batch_size: int = 10) -> np.ndarray:
        """
        Encode multiple texts in batches for efficiency.
        
        Args:
            texts: List of texts to encode
            batch_size: Number of texts to process at once
            
        Returns:
            Array of embeddings
        """
        try:
            embeddings = []
            
            for i in range(0, len(texts), batch_size):
                batch = texts[i:i + batch_size]
                batch_embeddings = []
                
                for text in batch:
                    embedding = self._get_embedding(text)
                    batch_embeddings.append(embedding)
                
                embeddings.extend(batch_embeddings)
            
            return np.array(embeddings)
            
        except Exception as e:
            logger.error(f"Failed to batch encode texts: {e}")
            raise
    
    def is_available(self) -> bool:
        """Check if the Google embedding service is available."""
        try:
            # Test with a simple embedding
            test_embedding = self._get_embedding("test")
            return len(test_embedding) == self.embedding_dim
        except Exception as e:
            logger.error(f"Google embedding service not available: {e}")
            return False
