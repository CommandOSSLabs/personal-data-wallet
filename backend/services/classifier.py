import re
from typing import Dict, List
from models import IntentType, ClassificationResult

class SimpleClassifier:
    def __init__(self):
        self.fact_keywords = [
            "my", "i am", "i have", "i will", "i'm", "i'll", "is", "are", "was", "were",
            "flight", "appointment", "meeting", "reminder", "schedule", "birthday",
            "address", "phone", "email", "work", "live", "study", "job", "favorite"
        ]
        
        self.query_keywords = [
            "what", "when", "where", "why", "how", "who", "which", "can you",
            "do you know", "tell me", "show me", "find", "search", "lookup",
            "?", "remind me", "what is", "when is", "where is"
        ]
        
        self.conversational_keywords = [
            "hello", "hi", "hey", "thanks", "thank you", "bye", "goodbye",
            "good morning", "good evening", "how are you", "nice", "great",
            "awesome", "cool", "ok", "okay", "yes", "no"
        ]

    def classify_intent(self, text: str) -> ClassificationResult:
        text_lower = text.lower().strip()
        
        # Check for question marks first
        if "?" in text:
            return ClassificationResult(intent=IntentType.QUERY, confidence=0.9)
        
        # Count keyword matches
        fact_score = self._count_keyword_matches(text_lower, self.fact_keywords)
        query_score = self._count_keyword_matches(text_lower, self.query_keywords)
        conv_score = self._count_keyword_matches(text_lower, self.conversational_keywords)
        
        # Determine intent based on scores
        scores = {
            IntentType.FACT_ADDITION: fact_score,
            IntentType.QUERY: query_score,
            IntentType.CONVERSATIONAL: conv_score
        }
        
        max_intent = max(scores, key=scores.get)
        max_score = scores[max_intent]
        
        # If no clear winner, check for specific patterns
        if max_score == 0:
            if self._contains_factual_pattern(text_lower):
                return ClassificationResult(intent=IntentType.FACT_ADDITION, confidence=0.7)
            else:
                return ClassificationResult(intent=IntentType.CONVERSATIONAL, confidence=0.5)
        
        confidence = min(0.95, 0.6 + (max_score * 0.1))
        return ClassificationResult(intent=max_intent, confidence=confidence)

    def _count_keyword_matches(self, text: str, keywords: List[str]) -> int:
        count = 0
        for keyword in keywords:
            if keyword in text:
                count += 1
        return count

    def _contains_factual_pattern(self, text: str) -> bool:
        # Check for patterns that indicate facts
        patterns = [
            r'\b\w+ is \w+',  # "X is Y"
            r'\b\w+ are \w+',  # "X are Y"
            r'\b\w+ has \w+',  # "X has Y"
            r'\b\w+ will \w+',  # "X will Y"
            r'\b\w+ on \w+',   # "X on Y" (dates/times)
            r'\b\w+ at \w+',   # "X at Y" (times/places)
        ]
        
        for pattern in patterns:
            if re.search(pattern, text):
                return True
        return False