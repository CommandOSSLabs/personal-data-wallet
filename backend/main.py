from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from contextlib import asynccontextmanager
import logging
import json
import asyncio
from datetime import datetime
from config import settings
from models import (
    IngestRequest, QueryRequest, IngestResponse, QueryResponse, 
    IntentType, ClassificationResult, CreateChatRequest, AddMessageRequest,
    CreateMemoryRequest, MemoryType, ChatSession, MemoryItem
)
from services.classifier import SimpleClassifier
from services.graph_extractor import GraphExtractor
from services.memory_manager import MemoryManager
from services.chat_storage import ChatStorage
from services.memory_storage import MemoryStorage
from services.gemini_chat import GeminiChatService

# Configure logging
logging.basicConfig(level=getattr(logging, settings.log_level))
logger = logging.getLogger(__name__)

# Global services
classifier = SimpleClassifier()
graph_extractor = GraphExtractor()
memory_manager = MemoryManager()
chat_storage = ChatStorage()
memory_storage = MemoryStorage()
gemini_chat = GeminiChatService()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Personal Data Wallet Backend")
    yield
    # Shutdown
    logger.info("Shutting down Personal Data Wallet Backend")
    await memory_manager.close()

app = FastAPI(
    title="Personal Data Wallet API",
    description="Decentralized, Self-Organizing Memory Layer for LLMs",
    version="0.1.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Personal Data Wallet API is running"}

@app.get("/health")
async def health():
    return {"status": "healthy", "version": "0.1.0"}

@app.post("/ingest", response_model=IngestResponse)
async def ingest_message(request: IngestRequest):
    try:
        logger.info(f"Processing ingest request for user: {request.user_id}")
        
        # Add user message to chat session if session_id provided
        if request.session_id:
            chat_storage.add_message(request.session_id, request.user_id, request.text, "user")
        
        # Step A: Classification
        classification = classifier.classify_intent(request.text)
        logger.info(f"Classification result: {classification.intent} (confidence: {classification.confidence})")
        
        response_text = ""
        
        if classification.intent == IntentType.FACT_ADDITION:
            # Step B: Knowledge Graph Extraction
            knowledge_graph = graph_extractor.extract_graph(request.text)
            logger.info(f"Extracted graph with {len(knowledge_graph.nodes)} nodes and {len(knowledge_graph.edges)} edges")
            
            # Step C & D: Embedding and On-Chain Storage (legacy system)
            success = await memory_manager.add_fact(
                request.user_id, 
                request.text, 
                knowledge_graph
            )
            
            # Store in new memory system
            if knowledge_graph.nodes:
                content = f"Entities: {', '.join(knowledge_graph.nodes)}"
                memory_storage.create_memory(
                    user_id=request.user_id,
                    content=content,
                    raw_text=request.text,
                    memory_type=MemoryType.FACT,
                    related_session_id=request.session_id
                )
            
            if success:
                response_text = "I've stored that information in your knowledge graph."
            else:
                response_text = "I've noted that information, though there was an issue with the knowledge graph storage."
                
        elif classification.intent == IntentType.QUERY:
            # Handle as a query instead
            context = await memory_manager.get_context_for_query(request.user_id, request.text)
            
            # Also search in new memory system
            stored_memories = memory_storage.search_memories(request.user_id, request.text)
            
            # Generate response based on context
            if context["similar_texts"] or stored_memories:
                response_parts = []
                
                if context["similar_texts"]:
                    response_parts.append(f"Based on what I know: {'; '.join(context['similar_texts'][:2])}")
                
                if stored_memories:
                    memory_content = [mem.content for mem in stored_memories[:2]]
                    response_parts.append(f"From your memories: {'; '.join(memory_content)}")
                
                response_text = " | ".join(response_parts)
            else:
                response_text = "I don't have enough information to answer that question yet."
            
        else:  # CONVERSATIONAL
            response_text = "I understand. Feel free to share any information you'd like me to remember!"
        
        # Add assistant response to chat session if session_id provided
        if request.session_id:
            chat_storage.add_message(request.session_id, request.user_id, response_text, "assistant")
        
        return IngestResponse(
            response=response_text,
            intent=classification.intent,
            entities=knowledge_graph if classification.intent == IntentType.FACT_ADDITION else None,
            success=True
        )
            
    except Exception as e:
        logger.error(f"Error processing ingest request: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat/stream")
async def stream_chat(request: IngestRequest):
    """Streaming chat endpoint with Gemini integration"""
    try:
        logger.info(f"Processing streaming chat request for user: {request.user_id}")
        
        # Add user message to chat session if session_id provided
        if request.session_id:
            chat_storage.add_message(request.session_id, request.user_id, request.text, "user")
        
        # Step A: Classification
        classification = classifier.classify_intent(request.text)
        logger.info(f"Classification result: {classification.intent} (confidence: {classification.confidence})")
        
        # Get memory context for better responses
        stored_memories = memory_storage.search_memories(request.user_id, request.text)
        context = gemini_chat.build_context_from_memory(
            [mem.dict() for mem in stored_memories], 
            classification.intent.value
        )
        
        async def generate_stream():
            collected_response = ""
            
            # Send initial metadata
            yield f"data: {json.dumps({'type': 'start', 'intent': classification.intent})}\n\n"
            
            if gemini_chat.is_available():
                # Stream from Gemini
                async for chunk in gemini_chat.generate_streaming_response(request.text, context):
                    collected_response += chunk
                    yield f"data: {json.dumps({'type': 'chunk', 'content': chunk})}\n\n"
            else:
                # Fallback response
                fallback_response = "I understand. Feel free to share any information you'd like me to remember!"
                collected_response = fallback_response
                
                # Simulate streaming for fallback
                words = fallback_response.split()
                for i, word in enumerate(words):
                    chunk = word + (" " if i < len(words) - 1 else "")
                    yield f"data: {json.dumps({'type': 'chunk', 'content': chunk})}\n\n"
                    await asyncio.sleep(0.05)  # Small delay
            
            # Handle knowledge graph extraction for facts
            entities = None
            if classification.intent == IntentType.FACT_ADDITION:
                knowledge_graph = graph_extractor.extract_graph(request.text)
                logger.info(f"Extracted graph with {len(knowledge_graph.nodes)} nodes")
                
                # Store in memory systems
                await memory_manager.add_fact(request.user_id, request.text, knowledge_graph)
                
                if knowledge_graph.nodes:
                    content = f"Entities: {', '.join(knowledge_graph.nodes)}"
                    memory_storage.create_memory(
                        user_id=request.user_id,
                        content=content,
                        raw_text=request.text,
                        memory_type=MemoryType.FACT,
                        related_session_id=request.session_id
                    )
                    entities = knowledge_graph
            
            # Add assistant response to chat session
            if request.session_id:
                chat_storage.add_message(request.session_id, request.user_id, collected_response, "assistant")
            
            # Send completion metadata
            yield f"data: {json.dumps({'type': 'end', 'intent': classification.intent, 'entities': entities.dict() if entities else None})}\n\n"
        
        return StreamingResponse(
            generate_stream(),
            media_type="text/plain",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            }
        )
        
    except Exception as e:
        logger.error(f"Error processing streaming chat request: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/query", response_model=QueryResponse)
async def query_memory(request: QueryRequest):
    try:
        logger.info(f"Processing query request for user: {request.user_id}")
        
        # Get context from memory
        context = await memory_manager.get_context_for_query(request.user_id, request.text)
        
        # Generate response based on context
        if context["similar_texts"]:
            # Synthesize answer from similar texts and graph context
            similar_texts = context["similar_texts"][:3]  # Top 3 most similar
            relevant_graph = context["relevant_graph"]
            
            response_parts = []
            
            # Add information from similar texts
            if similar_texts:
                response_parts.append("Based on what you've told me:")
                for i, text in enumerate(similar_texts, 1):
                    response_parts.append(f"{i}. {text}")
            
            # Add graph-based insights
            if relevant_graph["nodes"]:
                response_parts.append(f"Relevant entities: {', '.join(relevant_graph['nodes'][:5])}")
            
            response_text = "\n".join(response_parts)
        else:
            response_text = "I don't have enough information to answer that question. Please share more details so I can help you better."
        
        return QueryResponse(
            response=response_text,
            intent=IntentType.QUERY,
            context_used=context["similar_texts"],
            success=True
        )
        
    except Exception as e:
        logger.error(f"Error processing query request: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Chat Management Endpoints
@app.post("/chats", response_model=ChatSession)
async def create_chat_session(request: CreateChatRequest):
    try:
        session = chat_storage.create_session(request.user_id, request.title)
        return session
    except Exception as e:
        logger.error(f"Error creating chat session: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/chats/{user_id}")
async def get_user_chats(user_id: str):
    try:
        sessions = chat_storage.get_user_sessions(user_id)
        return {"sessions": sessions}
    except Exception as e:
        logger.error(f"Error getting user chats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/chats/{user_id}/{session_id}", response_model=ChatSession)
async def get_chat_session(user_id: str, session_id: str):
    try:
        session = chat_storage.get_session(user_id, session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Chat session not found")
        return session
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting chat session: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chats/message")
async def add_message_to_chat(request: AddMessageRequest):
    try:
        success = chat_storage.add_message(
            request.user_id, 
            request.session_id, 
            request.content, 
            request.type
        )
        if not success:
            raise HTTPException(status_code=404, detail="Chat session not found")
        return {"success": True, "message": "Message added successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding message: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/chats/{user_id}/{session_id}")
async def delete_chat_session(user_id: str, session_id: str):
    try:
        success = chat_storage.delete_session(user_id, session_id)
        if not success:
            raise HTTPException(status_code=404, detail="Chat session not found")
        return {"success": True, "message": "Chat session deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting chat session: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/chats/{user_id}/stats")
async def get_chat_stats(user_id: str):
    try:
        stats = chat_storage.get_user_stats(user_id)
        return stats
    except Exception as e:
        logger.error(f"Error getting chat stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Memory Management Endpoints
@app.post("/memories", response_model=MemoryItem)
async def create_memory(request: CreateMemoryRequest):
    try:
        memory = memory_storage.create_memory(
            user_id=request.user_id,
            content=request.content,
            raw_text=request.raw_text,
            memory_type=request.type,
            category=request.category,
            related_session_id=request.related_session_id,
            metadata=request.metadata
        )
        return memory
    except Exception as e:
        logger.error(f"Error creating memory: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/memories/{user_id}")
async def get_user_memories(user_id: str, category: str = None, memory_type: str = None):
    try:
        memory_type_enum = None
        if memory_type:
            memory_type_enum = MemoryType(memory_type)
        
        memories = memory_storage.get_user_memories(user_id, category, memory_type_enum)
        return {"memories": memories}
    except Exception as e:
        logger.error(f"Error getting user memories: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/memories/{user_id}/categories")
async def get_memories_by_category(user_id: str):
    try:
        categories = memory_storage.get_memories_by_category(user_id)
        return {"categories": categories}
    except Exception as e:
        logger.error(f"Error getting memories by category: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/memories/{user_id}/search")
async def search_memories(user_id: str, query: str):
    try:
        memories = memory_storage.search_memories(user_id, query)
        return {"memories": memories, "query": query}
    except Exception as e:
        logger.error(f"Error searching memories: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/memories/{user_id}/{memory_id}")
async def delete_memory(user_id: str, memory_id: str):
    try:
        success = memory_storage.delete_memory(user_id, memory_id)
        if not success:
            raise HTTPException(status_code=404, detail="Memory not found")
        return {"success": True, "message": "Memory deleted successfully"}  
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting memory: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/memories/{user_id}/clear")
async def clear_user_memories(user_id: str, category: str = None):
    try:
        success = memory_storage.clear_user_memories(user_id, category)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to clear memories")
        
        message = f"All memories cleared for user {user_id}"
        if category:
            message = f"Memories in category '{category}' cleared for user {user_id}"
        
        return {"success": True, "message": message}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error clearing memories: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/memories/{user_id}/stats")  
async def get_memory_stats_new(user_id: str):
    try:
        stats = memory_storage.get_user_stats(user_id)
        return stats
    except Exception as e:
        logger.error(f"Error getting memory stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Legacy memory endpoints (keeping for compatibility)
@app.get("/memory/{user_id}/stats")
async def get_memory_stats(user_id: str):
    try:
        vector_store = memory_manager.get_or_create_vector_store(user_id)
        knowledge_graph = memory_manager.get_or_create_knowledge_graph(user_id)
        
        return {
            "user_id": user_id,
            "vector_store_stats": vector_store.get_stats(),
            "knowledge_graph_stats": {
                "nodes": len(knowledge_graph.get("nodes", [])),
                "edges": len(knowledge_graph.get("edges", []))
            }
        }
    except Exception as e:
        logger.error(f"Error getting memory stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/memory/{user_id}/facts")
async def get_user_facts(user_id: str):
    try:
        # Get similar texts from vector search with a broad query
        similar_texts = await memory_manager.query_memory(user_id, "", k=100)
        
        knowledge_graph = memory_manager.get_or_create_knowledge_graph(user_id)
        
        return {
            "user_id": user_id,
            "facts": similar_texts,
            "entities": knowledge_graph.get("nodes", []),
            "relationships": knowledge_graph.get("edges", [])
        }
    except Exception as e:
        logger.error(f"Error getting user facts: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/memory/{user_id}/clear")
async def clear_user_memory(user_id: str):
    try:
        # Clear vector store
        if user_id in memory_manager.user_stores:
            del memory_manager.user_stores[user_id]
        
        # Clear knowledge graph
        if user_id in memory_manager.user_graphs:
            del memory_manager.user_graphs[user_id]
        
        # Remove stored files
        import os
        store_path = f"data/{user_id}_vector_store"
        graph_path = f"data/{user_id}_graph.json"
        
        for path in [f"{store_path}.hnsw", f"{store_path}.meta", graph_path]:
            if os.path.exists(path):
                os.remove(path)
        
        return {"message": f"Memory cleared for user {user_id}"}
    except Exception as e:
        logger.error(f"Error clearing user memory: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)