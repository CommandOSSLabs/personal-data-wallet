import numpy as np
from typing import List
from models import EmbeddingResult

class SimpleEmbeddingService:
    """Simple embedding service using basic text features (for testing purposes)"""
    
    def __init__(self):
        self.dimension = 128  # Smaller dimension for simple implementation

    def create_embedding(self, text: str) -> EmbeddingResult:
        # Create a simple embedding based on text features
        # This is a basic implementation for testing - not suitable for production
        
        # Basic features: length, word count, character frequencies, etc.
        words = text.lower().split()
        chars = list(text.lower())
        
        features = []
        
        # Text statistics
        features.append(len(text) / 100.0)  # normalized text length
        features.append(len(words) / 20.0)  # normalized word count
        features.append(len(set(words)) / len(words) if words else 0)  # vocabulary diversity
        
        # Character frequency features (a-z)
        char_counts = {}
        for c in 'abcdefghijklmnopqrstuvwxyz':
            char_counts[c] = chars.count(c) / len(chars) if chars else 0
        features.extend(char_counts.values())
        
        # Common word features
        common_words = ['the', 'is', 'at', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'to', 'for', 'of', 'with', 'by']
        for word in common_words:
            features.append(1.0 if word in text.lower() else 0.0)
        
        # Pad or truncate to desired dimension
        while len(features) < self.dimension:
            features.append(0.0)
        features = features[:self.dimension]
        
        return EmbeddingResult(
            vector=features,
            text=text
        )

    def create_embeddings_batch(self, texts: List[str]) -> List[EmbeddingResult]:
        return [self.create_embedding(text) for text in texts]

    def cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        # Convert to numpy arrays
        a = np.array(vec1)
        b = np.array(vec2)
        
        # Calculate cosine similarity
        dot_product = np.dot(a, b)
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)
        
        if norm_a == 0 or norm_b == 0:
            return 0.0
        
        similarity = dot_product / (norm_a * norm_b)
        return float(similarity)