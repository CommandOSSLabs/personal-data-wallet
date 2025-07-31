from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from enum import Enum
from datetime import datetime

class IntentType(str, Enum):
    FACT_ADDITION = "FACT_ADDITION"
    QUERY = "QUERY"
    CONVERSATIONAL = "CONVERSATIONAL"

class MemoryType(str, Enum):
    FACT = "fact"
    PREFERENCE = "preference"
    CONTEXT = "context"

class GraphEdge(BaseModel):
    source: str
    target: str
    label: str

class KnowledgeGraph(BaseModel):
    nodes: List[str]
    edges: List[GraphEdge]

# Chat Models
class Message(BaseModel):
    id: str
    content: str
    type: str  # 'user' or 'assistant'
    timestamp: datetime
    memory_detected: Optional[bool] = None
    memory_id: Optional[str] = None

class ChatSession(BaseModel):
    id: str
    user_id: str
    title: str
    messages: List[Message]
    created_at: datetime
    updated_at: datetime

class CreateChatRequest(BaseModel):
    user_id: str
    title: Optional[str] = "New Chat"

class AddMessageRequest(BaseModel):
    session_id: str
    user_id: str
    content: str
    type: str  # 'user' or 'assistant'

# Memory Models
class MemoryItem(BaseModel):
    id: str
    user_id: str
    content: str
    raw_text: str
    type: MemoryType
    category: str
    created_at: datetime
    related_sessions: List[str] = []
    metadata: Dict[str, Any] = {}

class CreateMemoryRequest(BaseModel):
    user_id: str
    content: str
    raw_text: str
    type: MemoryType = MemoryType.FACT
    category: str = "general"
    related_session_id: Optional[str] = None
    metadata: Dict[str, Any] = {}

# Existing Models
class ModelType(str, Enum):
    GEMINI = "gemini"
    GPT4 = "gpt-4"
    CLAUDE = "claude"
    LOCAL = "local"

class IngestRequest(BaseModel):
    text: str
    user_id: str = "default-user"
    session_id: Optional[str] = None
    model: ModelType = ModelType.GEMINI
    originalUserMessage: Optional[str] = None  # The actual user message without context
    memoryContext: Optional[str] = None  # Memory context for AI

class QueryRequest(BaseModel):
    text: str
    user_id: str = "default-user"
    model: ModelType = ModelType.GEMINI

class ClassificationResult(BaseModel):
    intent: IntentType
    confidence: float

class EmbeddingResult(BaseModel):
    vector: List[float]
    text: str

class IngestResponse(BaseModel):
    response: str
    intent: IntentType
    entities: Optional[KnowledgeGraph] = None
    success: bool = True

class QueryResponse(BaseModel):
    response: str
    intent: IntentType
    context_used: Optional[List[str]] = None
    success: bool = True

class MemoryObject(BaseModel):
    user_id: str
    vector_index_cert: Optional[str] = None
    graph_cert: Optional[str] = None
    last_updated: str