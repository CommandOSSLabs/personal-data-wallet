"""
Enhanced classifier for better memory detection from chat messages.
Uses improved patterns and AI-based detection for personal information.
"""
import re
from typing import List, Dict, Tuple
from models import IntentType, ClassificationResult

class EnhancedClassifier:
    def __init__(self):
        # Core personal information patterns
        self.personal_patterns = [
            # Identity & Basic Info
            r'\b(my name is|i\'m called|i am|call me|i go by)\s+\w+',
            r'\bi\'m\s+\d+\s*(years? old|yrs?)',
            r'\b(i live in|i\'m from|i grew up in|i\'m based in)\s+\w+',
            r'\b(my birthday is|i was born|born in|born on)\s+',
            r'\b(my address is|i live at)\s+',
            
            # Contact Information
            r'\b(my (phone|number|email|contact))\s*(is|:|=)\s*',
            r'\b(call me at|reach me at|contact me at)\s+',
            r'\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b',  # Phone patterns
            r'\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b',  # Email
            
            # Work & Career
            r'\bi work (at|for|as)\s+\w+',
            r'\b(my job is|i\'m employed as|i work as)\s+',
            r'\b(my company|my employer|my office)\s+',
            r'\b(my boss|my manager|my colleague)\s+',
            r'\b(my salary|i earn|i make)\s+',
            
            # Relationships & Family
            r'\b(my (wife|husband|girlfriend|boyfriend|partner|spouse))\s+',
            r'\b(my (mom|dad|mother|father|parent|child|son|daughter))\s+',
            r'\b(i\'m married to|i\'m dating|i\'m engaged to)\s+',
            r'\b(my friend|my buddy|my best friend)\s+\w+',
            
            # Preferences & Interests
            r'\bi (love|hate|enjoy|like|prefer|dislike)\s+\w+',
            r'\b(my favorite|i prefer|i usually)\s+',
            r'\b(my hobby is|i enjoy|i do|i practice)\s+',
            r'\bi\'m (good at|bad at|learning|studying)\s+',
            
            # Health & Medical
            r'\b(my doctor|i have|i suffer from|i\'m allergic to)\s+',
            r'\b(i take|my medication|my prescription)\s+',
            r'\b(i\'m diabetic|i have asthma|i\'m on)\s+',
            
            # Travel & Location
            r'\bi (visited|went to|traveled to|live in)\s+\w+',
            r'\b(i\'m going to|i\'m planning to visit|i\'m traveling to)\s+',
            r'\b(my trip to|my vacation in|i was in)\s+',
            
            # Possessions & Assets
            r'\bi (have|own|drive|bought|use)\s+a\s+\w+',
            r'\b(my car|my house|my apartment|my computer)\s+',
            r'\bi (bought|purchased|sold|own)\s+',
            
            # Goals & Plans
            r'\bi (want to|plan to|hope to|dream of|goal is to)\s+',
            r'\b(my goal|my plan|my dream|my aspiration)\s+(is|was)\s+',
            r'\bi\'m (planning|hoping|trying|working) to\s+',
            
            # Time & Schedule
            r'\bi (usually|always|never|often|sometimes)\s+\w+',
            r'\b(my schedule|my routine|i work|i sleep)\s+(is|at|from)\s+',
            r'\b(my meeting|my appointment|my deadline)\s+',
            
            # Education & Skills
            r'\bi (studied|graduated from|went to|learned)\s+',
            r'\b(my degree|my education|my school|my university)\s+',
            r'\bi (know how to|can|cannot|learned to)\s+',
            
            # Direct memory requests
            r'\b(remember|note|save|store|keep|don\'t forget|make sure|important|remind me)\b'
        ]
        
        # Enhanced keyword lists
        self.fact_keywords = [
            # Personal identity
            "my", "i", "me", "mine", "myself", "i'm", "i'll", "i've", "i'd",
            
            # Basic info
            "name", "age", "birthday", "born", "from", "live", "address", "home",
            
            # Contact
            "phone", "email", "contact", "number", "call", "text", "message", "reach",
            
            # Work & career
            "work", "job", "career", "company", "office", "employer", "employee",
            "colleague", "boss", "manager", "salary", "position", "title", "business",
            
            # Relationships
            "family", "friend", "mother", "father", "parent", "wife", "husband",
            "girlfriend", "boyfriend", "partner", "spouse", "child", "son", "daughter",
            "married", "dating", "engaged", "relationship", "know", "met",
            
            # Preferences & interests
            "love", "hate", "like", "dislike", "enjoy", "prefer", "favorite",
            "hobby", "interest", "passion", "activity", "good", "bad", "learning",
            
            # Health & medical
            "doctor", "medicine", "health", "medical", "hospital", "sick", "pain",
            "treatment", "therapy", "medication", "prescription", "allergic", "condition",
            
            # Education & skills
            "school", "university", "college", "studied", "study", "learned", "learn",
            "degree", "graduated", "education", "course", "skill", "knowledge", "training",
            
            # Travel & location
            "travel", "trip", "vacation", "visited", "went", "country", "city",
            "flight", "hotel", "airport", "destination", "explore", "tour",
            
            # Possessions
            "have", "own", "bought", "purchase", "sell", "use", "drive", "car",
            "house", "apartment", "computer", "device", "property",
            
            # Goals & plans  
            "want", "need", "plan", "goal", "hope", "wish", "dream", "future",
            "planning", "trying", "working", "aspiration", "objective",
            
            # Time & routine
            "usually", "always", "never", "often", "sometimes", "daily", "weekly",
            "schedule", "routine", "meeting", "appointment", "deadline",
            
            # Memory keywords
            "remember", "note", "save", "store", "keep", "forget", "important", "remind"
        ]
        
        self.query_keywords = [
            "what", "when", "where", "who", "why", "how", "which", "can", "could",
            "would", "should", "tell", "show", "find", "search", "look", "help",
            "explain", "describe", "list", "give", "provide", "get", "retrieve"
        ]
        
        self.conversational_keywords = [
            "hi", "hello", "hey", "thanks", "thank", "okay", "ok", "yes", "no",
            "sure", "maybe", "perhaps", "probably", "definitely", "absolutely",
            "awesome", "cool", "great", "nice", "good", "bad", "terrible", "amazing"
        ]

    def classify_intent(self, text: str) -> ClassificationResult:
        """Enhanced classification with better personal information detection"""
        text_lower = text.lower().strip()
        
        # Check for question marks first
        if "?" in text:
            return ClassificationResult(intent=IntentType.QUERY, confidence=0.9)
        
        # Enhanced pattern matching for personal information
        personal_score = self._count_personal_patterns(text_lower)
        fact_score = self._count_keyword_matches(text_lower, self.fact_keywords)
        query_score = self._count_keyword_matches(text_lower, self.query_keywords)
        conv_score = self._count_keyword_matches(text_lower, self.conversational_keywords)
        
        # Weight personal patterns heavily
        total_fact_score = fact_score + (personal_score * 3)
        
        # Determine intent based on scores
        scores = {
            IntentType.FACT_ADDITION: total_fact_score,
            IntentType.QUERY: query_score,
            IntentType.CONVERSATIONAL: conv_score
        }
        
        max_intent = max(scores, key=scores.get)
        max_score = scores[max_intent]
        
        # If no clear winner, check for specific patterns
        if max_score == 0:
            if self._contains_personal_info(text_lower):
                return ClassificationResult(intent=IntentType.FACT_ADDITION, confidence=0.8)
            else:
                return ClassificationResult(intent=IntentType.CONVERSATIONAL, confidence=0.5)
        
        # Higher confidence for personal information
        if max_intent == IntentType.FACT_ADDITION and personal_score > 0:
            confidence = min(0.95, 0.8 + (personal_score * 0.05))
        else:
            confidence = min(0.95, 0.6 + (max_score * 0.1))
            
        return ClassificationResult(intent=max_intent, confidence=confidence)

    def _count_personal_patterns(self, text: str) -> int:
        """Count matches for personal information patterns"""
        count = 0
        for pattern in self.personal_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                count += 1
        return count

    def _count_keyword_matches(self, text: str, keywords: List[str]) -> int:
        """Count keyword matches with word boundaries"""
        count = 0
        for keyword in keywords:
            if re.search(r'\b' + keyword + r'\b', text):
                count += 1
        return count

    def _contains_personal_info(self, text: str) -> bool:
        """Check for various patterns that indicate personal information"""
        
        # Enhanced factual patterns
        enhanced_patterns = [
            # Identity statements
            r'\bi\s+(am|was|will be|have been|used to be)\s+\w+',
            r'\bmy\s+\w+\s+(is|was|will be|are|were)\s+',
            
            # Possession statements
            r'\bi\s+(have|own|use|drive|live in|work at|study at)\s+',
            r'\bmy\s+(job|work|car|house|phone|computer|friend|family)\b',
            
            # Activity statements
            r'\bi\s+(love|hate|enjoy|like|prefer|do|practice|play|watch|read)\s+',
            r'\bi\s+(went|visited|traveled|moved|studied|worked|lived|met)\s+',
            
            # Future plans
            r'\bi\s+(want|need|plan|hope|will|going to|intend to)\s+',
            
            # Routine/habits
            r'\bi\s+(usually|always|never|often|sometimes|regularly|daily)\s+',
            
            # Relationships
            r'\bi\s+(know|met|married|dating|friends with|work with)\s+',
            
            # Skills/abilities
            r'\bi\s+(can|cannot|could|know how|learned|studied|good at|bad at)\s+',
            
            # Contact info patterns
            r'\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b',  # Phone
            r'\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b',  # Email
            r'\b\d{1,5}\s+[a-zA-Z0-9\s,]+\b',  # Address-like
            
            # Time/date patterns
            r'\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b',
            r'\b(january|february|march|april|may|june|july|august|september|october|november|december)\b',
            r'\b\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}\b',  # Dates
            
            # Location patterns
            r'\bin\s+(new york|california|texas|florida|chicago|boston|seattle|miami|atlanta)\b',
            r'\bat\s+\w+\s+(university|college|school|company|hospital|clinic)\b'
        ]
        
        for pattern in enhanced_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return True
                
        return False

    def should_store_as_memory(self, text: str) -> bool:
        """Determine if text contains information worth storing as memory"""
        text_lower = text.lower()
        
        # Check for any personal patterns
        personal_score = self._count_personal_patterns(text_lower)
        
        # Check for factual patterns
        factual_score = 1 if self._contains_personal_info(text_lower) else 0
        
        # Check for memory keywords
        memory_keywords = ['remember', 'note', 'save', 'store', 'keep', 'important', 'remind']
        memory_score = sum(1 for keyword in memory_keywords if keyword in text_lower)
        
        # Check for preference keywords (common personal info indicators)
        preference_keywords = ['favorite', 'love', 'like', 'prefer', 'enjoy', 'hate', 'dislike']
        preference_score = sum(1 for keyword in preference_keywords if keyword in text_lower)
        
        # Total score (weighted)
        total_score = (personal_score * 2) + factual_score + memory_score + preference_score
        
        # Debug logging (using logger instead of print for better visibility)
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"Memory detection for: '{text[:50]}...'")
        logger.info(f"  Personal patterns: {personal_score}")
        logger.info(f"  Factual patterns: {factual_score}")  
        logger.info(f"  Memory keywords: {memory_score}")
        logger.info(f"  Preference keywords: {preference_score}")
        logger.info(f"  Total score: {total_score}")
        logger.info(f"  Should store: {total_score >= 1}")
        
        # Store if we have a good confidence that this contains personal info
        return total_score >= 1  # Threshold for memory storage
    
    def extract_personal_details(self, text: str) -> Dict[str, List[str]]:
        """Extract specific personal details from text for better categorization"""
        details = {
            'identity': [],
            'contact': [],
            'work': [],
            'relationships': [],
            'preferences': [],
            'health': [],
            'travel': [],
            'education': [],
            'goals': [],
            'schedule': []
        }
        
        text_lower = text.lower()
        
        # Identity patterns
        name_match = re.search(r'(my name is|i\'m called|call me)\s+(\w+)', text_lower)
        if name_match:
            details['identity'].append(f"name: {name_match.group(2)}")
            
        age_match = re.search(r'i\'m\s+(\d+)\s*years? old', text_lower)
        if age_match:
            details['identity'].append(f"age: {age_match.group(1)}")
            
        # Contact patterns
        phone_match = re.search(r'\b(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})\b', text)
        if phone_match:
            details['contact'].append(f"phone: {phone_match.group(1)}")
            
        email_match = re.search(r'\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b', text)
        if email_match:
            details['contact'].append(f"email: {email_match.group(1)}")
            
        # Work patterns
        work_match = re.search(r'i work (at|for|as)\s+(.+?)(?:\.|$)', text_lower)
        if work_match:
            details['work'].append(f"employment: {work_match.group(2).strip()}")
            
        return details