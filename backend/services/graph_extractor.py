import re
from typing import List, Set, Tuple
from models import KnowledgeGraph, GraphEdge

class GraphExtractor:
    def __init__(self):
        self.entity_patterns = [
            r'\b[A-Z][a-z]+\b',  # Proper nouns
            r'\b\d{1,2}:\d{2}\s*(AM|PM)?\b',  # Times
            r'\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b',  # Days
            r'\b(January|February|March|April|May|June|July|August|September|October|November|December)\b',  # Months
            r'\b\d{1,2}/\d{1,2}/\d{2,4}\b',  # Dates
            r'\b[A-Za-z]+@[A-Za-z]+\.[A-Za-z]+\b',  # Emails
            r'\b\d{3}-\d{3}-\d{4}\b',  # Phone numbers
        ]
        
        self.relationship_patterns = [
            (r'(\w+)\s+is\s+(\w+)', 'is'),
            (r'(\w+)\s+has\s+(\w+)', 'has'),
            (r'(\w+)\s+works\s+at\s+(\w+)', 'works_at'),
            (r'(\w+)\s+lives\s+in\s+(\w+)', 'lives_in'),
            (r'(\w+)\s+to\s+(\w+)', 'destination'),
            (r'(\w+)\s+on\s+(\w+)', 'scheduled_on'),
            (r'(\w+)\s+at\s+(\w+)', 'scheduled_at'),
            (r'(\w+)\s+with\s+(\w+)', 'associated_with'),
        ]

    def extract_graph(self, text: str) -> KnowledgeGraph:
        # Extract entities
        entities = self._extract_entities(text)
        
        # Extract relationships
        edges = self._extract_relationships(text, entities)
        
        # Ensure all entities in edges are included in nodes
        all_nodes = set(entities)
        for edge in edges:
            all_nodes.add(edge.source)
            all_nodes.add(edge.target)
        
        return KnowledgeGraph(
            nodes=list(all_nodes),
            edges=edges
        )

    def _extract_entities(self, text: str) -> List[str]:
        entities = set()
        
        # Use predefined patterns
        for pattern in self.entity_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                if isinstance(match, tuple):
                    entities.update(match)
                else:
                    entities.add(match)
        
        # Extract quoted strings as entities
        quoted_entities = re.findall(r'"([^"]*)"', text)
        entities.update(quoted_entities)
        
        # Extract capitalized words that might be entities
        words = text.split()
        for word in words:
            # Remove punctuation
            clean_word = re.sub(r'[^\w]', '', word)
            if clean_word and clean_word[0].isupper() and len(clean_word) > 1:
                entities.add(clean_word)
        
        # Filter out common stop words and short words
        stop_words = {'The', 'This', 'That', 'And', 'Or', 'But', 'In', 'On', 'At', 'To', 'For', 'Of', 'With', 'By'}
        filtered_entities = [e for e in entities if e not in stop_words and len(e) > 1]
        
        return filtered_entities

    def _extract_relationships(self, text: str, entities: List[str]) -> List[GraphEdge]:
        edges = []
        text_lower = text.lower()
        
        # Use predefined relationship patterns
        for pattern, relation_type in self.relationship_patterns:
            matches = re.findall(pattern, text_lower)
            for match in matches:
                if len(match) == 2:
                    source, target = match
                    # Capitalize first letter to match entity format
                    source = source.capitalize()
                    target = target.capitalize()
                    
                    # Only add if both entities exist in our entity list
                    if source in entities and target in entities:
                        edges.append(GraphEdge(
                            source=source,
                            target=target,
                            label=relation_type
                        ))
        
        # Extract implicit relationships based on proximity
        edges.extend(self._extract_proximity_relationships(entities, text))
        
        return edges

    def _extract_proximity_relationships(self, entities: List[str], text: str) -> List[GraphEdge]:
        edges = []
        
        # Find entities that appear close to each other in the text
        entity_positions = {}
        for entity in entities:
            positions = []
            start = 0
            while True:
                pos = text.lower().find(entity.lower(), start)
                if pos == -1:
                    break
                positions.append(pos)
                start = pos + 1
            entity_positions[entity] = positions
        
        # Create relationships between nearby entities
        for entity1 in entities:
            for entity2 in entities:
                if entity1 != entity2:
                    for pos1 in entity_positions[entity1]:
                        for pos2 in entity_positions[entity2]:
                            distance = abs(pos1 - pos2)
                            # If entities are within 50 characters, create a relationship
                            if distance < 50:
                                edges.append(GraphEdge(
                                    source=entity1,
                                    target=entity2,
                                    label='related_to'
                                ))
                                break
        
        return edges