import numpy as np
from typing import List
from sentence_transformers import SentenceTransformer
from models import EmbeddingResult

class EmbeddingService:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model = SentenceTransformer(model_name)
        self.dimension = 384  # Dimension for all-MiniLM-L6-v2

    def create_embedding(self, text: str) -> EmbeddingResult:
        # Create embedding
        embedding = self.model.encode(text)
        
        # Convert to list for JSON serialization
        vector = embedding.tolist()
        
        return EmbeddingResult(
            vector=vector,
            text=text
        )

    def create_embeddings_batch(self, texts: List[str]) -> List[EmbeddingResult]:
        embeddings = self.model.encode(texts)
        
        results = []
        for i, text in enumerate(texts):
            vector = embeddings[i].tolist()
            results.append(EmbeddingResult(
                vector=vector,
                text=text
            ))
        
        return results

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