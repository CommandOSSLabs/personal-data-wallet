import os
import httpx
import json
from typing import List
from models import EmbeddingResult
from config import settings

class GeminiEmbeddingService:
    def __init__(self):
        self.api_key = os.getenv('GOOGLE_API_KEY') or settings.google_api_key
        self.model = "models/text-embedding-004"
        self.dimension = 768  # Gemini text-embedding-004 dimension
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"
        
        if not self.api_key:
            print("Warning: No Google API key found. Using fallback embedding service.")
            self.use_fallback = True
        else:
            self.use_fallback = False

    async def create_embedding(self, text: str) -> EmbeddingResult:
        """Create embedding using Gemini API"""
        if self.use_fallback:
            return self._create_fallback_embedding(text)
        
        try:
            async with httpx.AsyncClient() as client:
                url = f"{self.base_url}/{self.model}:embedContent"
                headers = {
                    "Content-Type": "application/json",
                }
                
                payload = {
                    "content": {
                        "parts": [{"text": text}]
                    }
                }
                
                response = await client.post(
                    url,
                    headers=headers,
                    json=payload,
                    params={"key": self.api_key},
                    timeout=30.0
                )
                
                if response.status_code != 200:
                    print(f"Gemini API error: {response.status_code} - {response.text}")
                    return self._create_fallback_embedding(text)
                
                data = response.json()
                embedding = data.get("embedding", {}).get("values", [])
                
                if not embedding:
                    print("No embedding returned from Gemini API")
                    return self._create_fallback_embedding(text)
                
                return EmbeddingResult(
                    vector=embedding,
                    text=text
                )
                
        except Exception as e:
            print(f"Error calling Gemini API: {e}")
            return self._create_fallback_embedding(text)

    async def create_embeddings_batch(self, texts: List[str]) -> List[EmbeddingResult]:
        """Create embeddings for multiple texts"""
        results = []
        for text in texts:
            embedding = await self.create_embedding(text)
            results.append(embedding)
        return results

    def _create_fallback_embedding(self, text: str) -> EmbeddingResult:
        """Fallback embedding using simple text features"""
        words = text.lower().split()
        chars = list(text.lower())
        
        features = []
        
        # Basic text statistics
        features.append(len(text) / 100.0)
        features.append(len(words) / 20.0)
        features.append(len(set(words)) / max(len(words), 1))
        
        # Character frequency features (a-z)
        for c in 'abcdefghijklmnopqrstuvwxyz':
            features.append(chars.count(c) / max(len(chars), 1))
        
        # Common word features
        common_words = ['the', 'is', 'at', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'to', 'for', 'of', 'with', 'by']
        for word in common_words:
            features.append(1.0 if word in text.lower() else 0.0)
        
        # Question words
        question_words = ['what', 'when', 'where', 'why', 'how', 'who', 'which']
        for word in question_words:
            features.append(1.0 if word in text.lower() else 0.0)
        
        # Punctuation features
        features.append(1.0 if '?' in text else 0.0)
        features.append(1.0 if '!' in text else 0.0)
        features.append(text.count('.') / max(len(text), 1))
        
        # Pad to match Gemini dimension
        while len(features) < self.dimension:
            features.append(0.0)
        features = features[:self.dimension]
        
        return EmbeddingResult(
            vector=features,
            text=text
        )

    def cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Calculate cosine similarity between two vectors"""
        import numpy as np
        
        a = np.array(vec1)
        b = np.array(vec2)
        
        dot_product = np.dot(a, b)
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)
        
        if norm_a == 0 or norm_b == 0:
            return 0.0
        
        similarity = dot_product / (norm_a * norm_b)
        return float(similarity)