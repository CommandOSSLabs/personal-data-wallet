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
from services.enhanced_classifier import EnhancedClassifier
from services.graph_extractor import GraphExtractor
from services.memory_manager import MemoryManager
from services.chat_storage import ChatStorage
from services.memory_storage import MemoryStorage
from services.gemini_chat import GeminiChatService
from services.two_stage_query import TwoStageQueryService
from services.google_embeddings import GoogleEmbeddingService
from services.sui_chat_sessions import SuiChatSessionsService
from services.vector_storage import VectorStorageService

# Configure logging
logging.basicConfig(level=getattr(logging, settings.log_level))
logger = logging.getLogger(__name__)

# Global services - SHARED INSTANCES to ensure consistency
classifier = EnhancedClassifier()
graph_extractor = GraphExtractor()
memory_manager = MemoryManager()
chat_storage = ChatStorage()
memory_storage = MemoryStorage()
gemini_chat = GeminiChatService()
embedding_service = GoogleEmbeddingService()
sui_chat_sessions = SuiChatSessionsService()

# IMPORTANT: Use single shared VectorStorageService instance for both storage and search
vector_storage = VectorStorageService()
query_service = TwoStageQueryService()
query_service.storage_service = vector_storage  # Use shared instance

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Personal Data Wallet Backend")
    yield
    # Shutdown
    logger.info("Shutting down Personal Data Wallet Backend")
    await memory_manager.close()
    await vector_storage.close()
    await query_service.close()

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
            chat_storage.add_message(request.user_id, request.session_id, request.text, "user")
        
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
            
            # Store in blockchain memory system
            if knowledge_graph.nodes:
                content = f"Entities: {', '.join(knowledge_graph.nodes)}"
                category = "knowledge_graph"
                
                # Store memory on blockchain instead of locally
                try:
                    storage_result = await vector_storage.store_memory(
                        text=content,
                        category=category,
                        user_address=request.user_id
                    )
                    if storage_result:
                        logger.info(f"Successfully stored memory on blockchain: {storage_result.memory_id}")
                    else:
                        logger.warning("Failed to store memory on blockchain, falling back to local storage")
                        memory_storage.create_memory(
                            user_id=request.user_id,
                            content=content,
                            raw_text=request.text,
                            memory_type=MemoryType.FACT,
                            related_session_id=request.session_id
                        )
                except Exception as e:
                    logger.error(f"Error storing memory on blockchain: {e}")
                    # Fallback to local storage
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
            chat_storage.add_message(request.user_id, request.session_id, response_text, "assistant")
        
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
    """Streaming chat endpoint with Gemini integration and Sui session support"""
    try:
        logger.info(f"Processing streaming chat request for user: {request.user_id}")

        # Add user message to Sui chat session if session_id provided
        if request.session_id:
            try:
                # Use originalUserMessage if provided, otherwise fall back to text
                user_message_content = request.originalUserMessage or request.text

                await sui_chat_sessions.add_message(
                    session_id=request.session_id,
                    user_address=request.user_id,
                    message_content=user_message_content,
                    message_type="user"
                )
                logger.info(f"Added user message to Sui session: {request.session_id}")
                logger.debug(f"User message content: {user_message_content[:100]}...")
            except Exception as e:
                logger.warning(f"Failed to add user message to Sui session: {e}")

        # Step A: Classification
        classification = classifier.classify_intent(request.text)
        logger.info(f"Classification result: {classification.intent} (confidence: {classification.confidence})")

        # Enhanced memory context injection - always try to get relevant memories
        context = ""
        if request.memoryContext:
            context = request.memoryContext
            logger.info("Using memory context from frontend")
        
        # Always try to enhance with backend memories for coding questions
        try:
            # Enhanced context retrieval for tech/coding questions
            coding_keywords = ['code', 'programming', 'development', 'tech', 'stack', 'framework', 
                             'language', 'javascript', 'typescript', 'python', 'react', 'node']
            is_coding_related = any(keyword in request.text.lower() for keyword in coding_keywords)
            
            if is_coding_related:
                logger.info(f"Detected coding-related query, retrieving tech memories for: {request.text}")
                
                # Search for relevant memories
                tech_memories = await vector_storage.search_memories(
                    query=request.text + " technology programming development",
                    k=3,
                    user_filter=request.user_id
                )
                
                if tech_memories:
                    memory_context = "📋 **Your Tech Profile:**\n"
                    for i, memory in enumerate(tech_memories, 1):
                        memory_context += f"{i}. {memory.content}\n"
                    
                    context = memory_context + "\n" + (context or "")
                    logger.info(f"Enhanced context with {len(tech_memories)} tech memories")
            
            # General memory context as fallback
            if not context.strip():
                context_result = await query_service.full_query_with_context(
                    query_text=request.text,
                    user_address=request.user_id,
                    max_memories=3
                )
                context = context_result.context_text if hasattr(context_result, 'context_text') else ""
                logger.info("Using general memory context from backend")
                
        except Exception as e:
            logger.warning(f"Failed to get enhanced memory context: {e}")
            if not context:
                context = ""
        
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
            
            # Enhanced automatic memory detection and storage
            entities = None
            stored_memory_id = None
            
            # Check if message contains information worth storing (regardless of intent)
            logger.info(f"Checking memory storage for: '{request.text}'")
            should_store = classifier.should_store_as_memory(request.text)
            logger.info(f"Memory storage decision: {should_store}")
            
            if should_store:
                try:
                    logger.info(f"Detected memory-worthy information in message: {request.text[:100]}...")
                    
                    # Store in vector storage system (the enhanced system)
                    storage_result = await vector_storage.store_memory(
                        text=request.text,
                        category="auto-detected",  # Will be auto-categorized by the storage service
                        user_address=request.user_id
                    )
                    
                    if storage_result and storage_result.success:
                        stored_memory_id = storage_result.embedding_id
                        logger.info(f"Successfully stored memory: {stored_memory_id}")
                    else:
                        error_msg = storage_result.error if storage_result else "Unknown error"
                        logger.warning(f"Failed to store memory: {error_msg}")
                        stored_memory_id = None
                        
                except Exception as e:
                    logger.error(f"Error during automatic memory storage: {e}")
            else:
                logger.info("No memory-worthy information detected, skipping storage")
            
            # Also handle traditional knowledge graph extraction for FACT_ADDITION intent
            if classification.intent == IntentType.FACT_ADDITION:
                knowledge_graph = graph_extractor.extract_graph(request.text)
                logger.info(f"Extracted graph with {len(knowledge_graph.nodes)} nodes")
                
                # Store in legacy memory systems for compatibility
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
            
            # Save user message with memory properties to regular chat storage
            if request.session_id:
                try:
                    # Determine memory detection status
                    memory_detected = stored_memory_id is not None
                    
                    # Save user message with memory metadata
                    chat_storage.add_message(
                        user_id=request.user_id,
                        session_id=request.session_id,
                        content=request.originalUserMessage or request.text,
                        message_type="user",
                        memory_detected=memory_detected,
                        memory_id=stored_memory_id
                    )
                    logger.info(f"Saved user message with memory data: detected={memory_detected}, id={stored_memory_id}")
                except Exception as e:
                    logger.warning(f"Failed to save user message to chat storage: {e}")
            
            # Add assistant response to Sui chat session
            if request.session_id:
                try:
                    await sui_chat_sessions.add_message(
                        session_id=request.session_id,
                        user_address=request.user_id,
                        message_content=collected_response,
                        message_type="assistant"
                    )
                    logger.info(f"Added assistant response to Sui session: {request.session_id}")
                except Exception as e:
                    logger.warning(f"Failed to add assistant response to Sui session: {e}")
                    
                # Also save assistant response to regular chat storage
                try:
                    chat_storage.add_message(
                        user_id=request.user_id,
                        session_id=request.session_id,
                        content=collected_response,
                        message_type="assistant"
                        # Assistant messages don't have memory detection
                    )
                    logger.info(f"Saved assistant response to chat storage")
                except Exception as e:
                    logger.warning(f"Failed to save assistant response to chat storage: {e}")
            
            # Send completion metadata including memory storage result
            completion_data = {
                'type': 'end', 
                'intent': classification.intent, 
                'entities': entities.model_dump() if entities else None,
                'memoryStored': stored_memory_id is not None,
                'memoryId': stored_memory_id
            }
            yield f"data: {json.dumps(completion_data)}\n\n"
        
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

# Blockchain memory endpoints 
@app.get("/memory/{user_id}/stats")
async def get_memory_stats(user_id: str):
    try:
        # Get stats from blockchain storage
        blockchain_stats = await query_service.get_memory_stats(user_id)
        
        # Fallback to legacy system if blockchain returns no data
        if not blockchain_stats or blockchain_stats.get("total_memories", 0) == 0:
            logger.info(f"No blockchain memories found for {user_id}, checking legacy system")
            vector_store = memory_manager.get_or_create_vector_store(user_id)
            knowledge_graph = memory_manager.get_or_create_knowledge_graph(user_id)
            
            return {
                "user_id": user_id,
                "source": "legacy",
                "vector_store_stats": vector_store.get_stats(),
                "knowledge_graph_stats": {
                    "nodes": len(knowledge_graph.get("nodes", [])),
                    "edges": len(knowledge_graph.get("edges", []))
                }
            }
        
        return {
            "user_id": user_id,
            "source": "blockchain",
            "total_memories": blockchain_stats.get("total_memories", 0),
            "categories": blockchain_stats.get("categories", []),
            "last_updated": blockchain_stats.get("last_updated")
        }
    except Exception as e:
        logger.error(f"Error getting memory stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/memory/{user_id}/facts")
async def get_user_facts(user_id: str):
    try:
        # Query blockchain storage first
        blockchain_memories = await query_service.search_memories(
            user_address=user_id,
            query_text="",  # Empty query to get all memories
            k=100
        )
        
        # Fallback to legacy system if no blockchain data
        if not blockchain_memories or len(blockchain_memories.memories) == 0:
            logger.info(f"No blockchain memories found for {user_id}, using legacy system")
            similar_texts = await memory_manager.query_memory(user_id, "", k=100)
            knowledge_graph = memory_manager.get_or_create_knowledge_graph(user_id)
            
            return {
                "user_id": user_id,
                "source": "legacy",
                "facts": similar_texts,
                "entities": knowledge_graph.get("nodes", []),
                "relationships": knowledge_graph.get("edges", [])
            }
        
        return {
            "user_id": user_id,
            "source": "blockchain", 
            "facts": [{"content": m.text_preview, "category": m.category} for m in blockchain_memories.memories],
            "total_memories": blockchain_memories.total_memories,
            "context_used": blockchain_memories.context_memories
        }
    except Exception as e:
        logger.error(f"Error getting user facts: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/memory/{user_id}/search")
async def search_memories_enhanced(
    user_id: str, 
    query: str = "", 
    k: int = 10, 
    include_content: bool = False
):
    """Enhanced memory search with optional full content retrieval"""
    try:
        logger.info(f"Enhanced search for user {user_id}: '{query}' (include_content: {include_content})")
        
        # Use the enhanced search method
        results = await vector_storage.search_memories_with_content(
            query=query,
            k=k,
            user_filter=user_id,
            include_content=include_content
        )
        
        return {
            "user_id": user_id,
            "query": query,
            "results": results,
            "total_found": len(results),
            "include_content": include_content
        }
        
    except Exception as e:
        logger.error(f"Error in enhanced memory search: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/memory/content/{walrus_hash}")
async def get_memory_content(walrus_hash: str):
    """Retrieve and decrypt the full content of a specific memory"""
    try:
        logger.info(f"Retrieving memory content for Walrus hash: {walrus_hash}")
        
        content = await vector_storage.get_memory_content(walrus_hash)
        
        if content is None:
            raise HTTPException(status_code=404, detail="Memory content not found")
        
        return {
            "walrus_hash": walrus_hash,
            "content": content,
            "status": "decrypted"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving memory content: {e}")
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

# New Advanced Memory API Endpoints

@app.post("/api/memories")
async def store_memory(request: dict):
    """Store a new memory using the advanced two-stage system."""
    try:
        content = request.get("content")
        category = request.get("category", "general")
        user_address = request.get("userAddress")

        if not all([content, user_address]):
            raise HTTPException(status_code=400, detail="Missing required fields")

        # For now, simulate user signature
        user_signature = "simulated_signature"

        embedding_id = await query_service.store_new_memory(
            text=content,
            category=category,
            user_address=user_address,
            user_signature=user_signature
        )

        if embedding_id:
            return {
                "success": True,
                "embeddingId": embedding_id,
                "message": "Memory stored successfully"
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to store memory")

    except Exception as e:
        logger.error(f"Error storing memory: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/memories")
async def get_memories(user: str):
    """Get user's memories (metadata only for privacy)."""
    try:
        # This would typically return metadata from the indexer
        # For now, return empty list
        return {"memories": []}
    except Exception as e:
        logger.error(f"Error getting memories: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/memories/search")
async def search_memories(request: dict):
    """Search memories using the two-stage query system."""
    try:
        query = request.get("query", "")
        user_address = request.get("userAddress")
        category = request.get("category")
        k = request.get("k", 10)

        if not user_address:
            raise HTTPException(status_code=400, detail="Missing user address")

        # If query is empty, use a broad search to get all memories
        if not query.strip():
            query = "memory personal data information"

        # For now, simulate user signature
        user_signature = "simulated_signature"

        # Perform stage 1 search (metadata only)
        results = await query_service.stage1_metadata_search(
            query_text=query,
            k=k,
            category_filter=category,
            owner_filter=user_address
        )

        # Convert results to API format
        api_results = []
        for result in results:
            api_results.append({
                "id": result.embedding_id,
                "content": result.preview,
                "category": result.category,
                "similarity": result.similarity_score,
                "timestamp": result.timestamp,
                "isEncrypted": True,
                "owner": result.owner,
                "walrusHash": getattr(result, 'walrus_hash', None)
            })

        return {"results": api_results}

    except Exception as e:
        logger.error(f"Error searching memories: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/memories/{memory_id}")
async def delete_memory(memory_id: str, request: dict):
    """Delete a memory (placeholder - would need Sui integration)."""
    try:
        user_address = request.get("userAddress")
        if not user_address:
            raise HTTPException(status_code=400, detail="Missing user address")

        # This would call Sui to remove the embedding
        # For now, just return success
        return {"success": True, "message": "Memory deleted"}

    except Exception as e:
        logger.error(f"Error deleting memory: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat/context")
async def get_chat_context(request: dict):
    """Get relevant context for chat using the two-stage query system."""
    try:
        query = request.get("query")
        user_address = request.get("userAddress")

        if not all([query, user_address]):
            raise HTTPException(status_code=400, detail="Missing required fields")

        # For now, simulate user signature
        user_signature = "simulated_signature"

        # Get context using full query system
        context_result = await query_service.full_query_with_context(
            query_text=query,
            user_address=user_address,
            max_memories=5
        )

        return context_result

    except Exception as e:
        logger.error(f"Error getting chat context: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Sui Chat Sessions API Endpoints

@app.post("/api/chat/sessions")
async def create_chat_session(request: dict):
    """Create a new chat session on Sui."""
    try:
        user_address = request.get("userAddress")
        title = request.get("title", "New Chat")

        if not user_address:
            raise HTTPException(status_code=400, detail="Missing user address")

        session_data = await sui_chat_sessions.create_session(
            user_address=user_address,
            title=title
        )

        return {
            "success": True,
            "session": session_data
        }

    except Exception as e:
        logger.error(f"Error creating chat session: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/chat/sessions")
async def get_chat_sessions(userAddress: str):
    """Get all chat sessions for a user."""
    try:
        if not userAddress:
            raise HTTPException(status_code=400, detail="Missing user address")

        sessions = await sui_chat_sessions.get_user_sessions(userAddress)

        return {
            "success": True,
            "sessions": sessions
        }

    except Exception as e:
        logger.error(f"Error getting chat sessions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/chat/sessions/{session_id}")
async def get_chat_session(session_id: str, userAddress: str):
    """Get a specific chat session."""
    try:
        if not userAddress:
            raise HTTPException(status_code=400, detail="Missing user address")

        session = await sui_chat_sessions.get_session(session_id, userAddress)

        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        return {
            "success": True,
            "session": session
        }

    except Exception as e:
        logger.error(f"Error getting chat session: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat/sessions/{session_id}/messages")
async def add_message_to_session(session_id: str, request: dict):
    """Add a message to a chat session."""
    try:
        user_address = request.get("userAddress")
        content = request.get("content")
        message_type = request.get("type", "user")

        logger.info(f"Adding message to session {session_id} for user {user_address}")

        if not all([user_address, content]):
            raise HTTPException(status_code=400, detail="Missing required fields")

        # Check if session exists first
        session = await sui_chat_sessions.get_session(session_id, user_address)
        if not session:
            logger.error(f"Session {session_id} not found for user {user_address}")
            raise HTTPException(status_code=404, detail="Session not found")

        success = await sui_chat_sessions.add_message(
            session_id=session_id,
            user_address=user_address,
            message_content=content,
            message_type=message_type
        )

        if success:
            return {"success": True, "message": "Message added"}
        else:
            raise HTTPException(status_code=500, detail="Failed to add message")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding message: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/chat/sessions/{session_id}")
async def delete_chat_session(session_id: str, request: dict):
    """Delete a chat session."""
    try:
        user_address = request.get("userAddress")

        if not user_address:
            raise HTTPException(status_code=400, detail="Missing user address")

        success = await sui_chat_sessions.delete_session(session_id, user_address)

        if success:
            return {"success": True, "message": "Session deleted"}
        else:
            raise HTTPException(status_code=500, detail="Failed to delete session")

    except Exception as e:
        logger.error(f"Error deleting session: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)