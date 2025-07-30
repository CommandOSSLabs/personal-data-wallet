# Personal Data Wallet - Complete Codebase Index

## 📋 Project Overview
A comprehensive personal data wallet with intelligent chat interface, memory management, and secure blockchain storage using Next.js frontend + Python FastAPI backend.

## 🏗️ Architecture Overview

### Frontend (Next.js 14 + TypeScript + Mantine UI)
- **Framework**: Next.js 14 with App Router
- **UI Library**: Mantine UI components (replacing Tailwind CSS)
- **State Management**: TanStack Query for server state
- **Authentication**: Sui wallet integration
- **Styling**: Mantine theme system

### Backend (Python FastAPI)
- **Framework**: FastAPI with async/await
- **Database**: File-based storage + Redis caching
- **AI/ML**: Google Gemini API, embeddings, vector search
- **Blockchain**: Sui network integration
- **Storage**: Walrus decentralized storage
- **Security**: Seal encryption for privacy

## 📁 Frontend Structure (`/app`)

### 🔌 API Layer (`/app/api`)
- **`httpApi.ts`**: Centralized HTTP client with interceptors, error handling, streaming support
- **`chatApi.ts`**: Chat operations (sessions, messages, streaming)
- **`memoryApi.ts`**: Memory management operations
- **`index.ts`**: API exports

### 🧩 Components (`/app/components`)

#### Authentication (`/auth`)
- **`login-page.tsx`**: Sui wallet connection interface

#### Chat System (`/chat`)
- **`chat-interface.tsx`**: Main chat container with sidebar, memory integration
- **`chat-window.tsx`**: Message display with streaming support
- **`chat-input.tsx`**: Message input with model selection
- **`message.tsx`**: Individual message component
- **`markdown-renderer.tsx`**: Markdown rendering with syntax highlighting
- **`model-selector.tsx`**: AI model selection dropdown
- **`cyber-*`**: Alternative cyberpunk-themed UI components

#### Memory System (`/memory`)
- **`memory-indicator.tsx`**: Real-time memory processing status
- **`memory-manager.tsx`**: Memory CRUD operations interface

#### Sidebar (`/sidebar`)
- **`sidebar.tsx`**: Session management, user profile, memory access

#### UI Components (`/ui`)
- **`button.tsx`**: Custom button components
- **`input.tsx`**: Form input components
- **`blockchain-button.tsx`**: Blockchain-specific UI elements
- **`terminal-window.tsx`**: Terminal-style containers
- **`cyber-*`**: Cyberpunk-themed UI components

### 🎣 Hooks (`/app/hooks`)
- **`use-sui-auth.ts`**: Sui wallet authentication state
- **`use-sui-chat-sessions.ts`**: Chat session management with Sui integration
- **`use-streaming-chat.ts`**: Real-time chat streaming
- **`use-chat-sessions.ts`**: Local chat session management
- **`use-send-message.ts`**: Message sending logic

### 🔧 Services (`/app/services`)
- **`memoryDetection.ts`**: Personal information detection and categorization
- **`memoryIntegration.ts`**: Memory system integration with chat

### 🏪 Providers (`/app/providers`)
- **`mantine-provider.tsx`**: Mantine UI theme and components
- **`query-provider.tsx`**: TanStack Query client setup
- **`sui-provider.tsx`**: Sui wallet provider configuration

### 📝 Types (`/app/types`)
- **`index.ts`**: TypeScript type definitions for messages, sessions, memory

## 🐍 Backend Structure (`/backend`)

### 🚀 Main Application
- **`main.py`**: FastAPI app with all endpoints, middleware, lifecycle management
- **`models.py`**: Pydantic models for API requests/responses
- **`config.py`**: Environment configuration and settings

### 🔧 Services (`/backend/services`)

#### Core Services
- **`memory_manager.py`**: Central memory orchestration
- **`chat_storage.py`**: Chat session persistence
- **`memory_storage.py`**: Memory item storage and retrieval

#### AI/ML Services
- **`gemini_chat.py`**: Google Gemini chat integration
- **`google_embeddings.py`**: Google embedding service
- **`classifier.py`**: Intent classification
- **`graph_extractor.py`**: Knowledge graph extraction

#### Vector & Search
- **`vector_store.py`**: Vector storage and similarity search
- **`hnsw_indexer.py`**: HNSW index management
- **`two_stage_query.py`**: Two-stage memory retrieval

#### Blockchain Integration
- **`sui_client.py`**: Sui blockchain RPC client
- **`sui_chat_sessions.py`**: Sui-based session management
- **`walrus_client.py`**: Walrus decentralized storage
- **`seal_encryption.py`**: Seal encryption for privacy

## 🔗 Blockchain Layer (`/sui-contract`)

### Smart Contracts (Move Language)
- **`memory_wallet.move`**: Core memory object management
- **`vector_index.move`**: Vector index contract
- **`chat_sessions.move`**: Chat session management
- **`Move.toml`**: Package configuration

### Tests
- **`memory_wallet_tests.move`**: Contract test suite

## ⚙️ Configuration & Setup

### Package Management
- **`package.json`**: Frontend dependencies (Mantine, TanStack Query, Sui SDK)
- **`requirements.txt`**: Backend dependencies (FastAPI, Google AI, Sui tools)

### Build & Deploy
- **`docker-compose.yml`**: Multi-service deployment (frontend, backend, Redis, Sui node)
- **`Dockerfile.frontend`**: Frontend container build
- **`backend/Dockerfile`**: Backend container build

### Development
- **`tsconfig.json`**: TypeScript configuration
- **`tailwind.config.js`**: Tailwind CSS setup (legacy)
- **`postcss.config.js`**: PostCSS configuration
- **`next.config.js`**: Next.js configuration

### Scripts
- **`scripts/setup.sh`**: Environment setup automation
- **`scripts/test-system.sh`**: System testing script
- **`backend/start_server.sh`**: Backend startup script

## 📊 Data Models & Types

### Frontend Types (TypeScript)
```typescript
interface Message {
  id: string
  content: string
  type: 'user' | 'assistant'
  timestamp: string
}

interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

interface MemoryItem {
  id: string
  content: string
  category: string
  timestamp: string
  isEncrypted: boolean
  owner: string
}
```

### Backend Models (Python/Pydantic)
```python
class ChatSession(BaseModel):
    id: str
    user_id: str
    title: str
    messages: List[Message]
    created_at: datetime
    updated_at: datetime

class MemoryItem(BaseModel):
    id: str
    user_id: str
    content: str
    type: MemoryType
    category: str
    created_at: datetime
    metadata: Dict[str, Any]
```

## 🔌 Integration Points

### External Services
- **Google Gemini API**: Chat completions and embeddings
- **Sui Network**: Blockchain transactions and storage
- **Walrus**: Decentralized blob storage
- **Seal Servers**: Identity-based encryption
- **Redis**: Caching and session storage

### API Endpoints
- **Chat**: `/chat/stream`, `/api/chat/sessions`
- **Memory**: `/api/memories`, `/api/memories/search`
- **Health**: `/health`, `/api/health`

## 🔒 Security Features
- **End-to-end encryption**: Via Seal servers
- **Blockchain verification**: On Sui network
- **Decentralized storage**: On Walrus
- **User-controlled access**: With signature verification
- **Privacy-preserving**: Memory encryption before storage

## 🚀 Key Features Implemented
✅ **Chat Interface**: Messages display and persist correctly
✅ **Streaming Responses**: Character-by-character AI responses  
✅ **Memory Detection**: Automatic personal information extraction
✅ **Secure Storage**: Encrypted blockchain-based memory storage
✅ **Context Enhancement**: AI receives relevant memory context
✅ **Session Management**: Proper chat session lifecycle
✅ **Error Handling**: Robust error recovery and user feedback

## 📈 Performance & Scalability
- **Caching**: Redis for frequently accessed data
- **Vector Search**: HNSW index for fast similarity search
- **Streaming**: Real-time response generation
- **Async Processing**: Non-blocking memory operations
- **Modular Architecture**: Scalable service-oriented design

## 🧪 Testing & Development
- **Hot Reload**: Next.js dev server
- **API Testing**: FastAPI automatic docs
- **Container Support**: Docker Compose for full stack
- **Environment Management**: dotenv configuration
- **Logging**: Comprehensive debug information

## 🔄 Data Flow Architecture

### Memory System Pipeline
1. **Detection**: `memoryDetectionService.analyzeMessage()` identifies personal info
2. **Storage**: `memoryApi.createMemory()` → Embeddings → Encryption → Blockchain
3. **Retrieval**: Context-aware memory search for AI responses
4. **Integration**: Non-blocking processing with visual feedback

### Chat Message Flow
1. **User Input**: Chat input component captures message
2. **Context Enhancement**: Memory system adds relevant context
3. **API Call**: Streaming request to backend
4. **AI Processing**: Gemini generates response with memory context
5. **Storage**: Messages saved to session with proper timestamps
6. **Display**: Real-time streaming display in chat window

### Authentication Flow
1. **Wallet Connection**: Sui wallet provider handles connection
2. **Address Extraction**: User address used as identifier
3. **Session Management**: Address-based session isolation
4. **Signature Verification**: Blockchain signatures for secure operations

## 🛠️ Development Workflow

### Frontend Development
```bash
npm run dev          # Start Next.js dev server
npm run build        # Production build
npm run lint         # ESLint checking
```

### Backend Development
```bash
cd backend
uvicorn main:app --reload  # Start FastAPI server
python test_config.py     # Test configuration
```

### Full Stack Development
```bash
docker-compose up    # Start all services
docker-compose down  # Stop all services
```

## 📚 Key Dependencies

### Frontend Dependencies
- **@mantine/core**: UI component library
- **@tanstack/react-query**: Server state management
- **@mysten/sui**: Sui blockchain SDK
- **axios**: HTTP client
- **react-markdown**: Markdown rendering

### Backend Dependencies
- **fastapi**: Web framework
- **pydantic**: Data validation
- **google-generativeai**: Gemini API
- **hnswlib**: Vector similarity search
- **httpx**: Async HTTP client

## 🐛 Known Issues & Solutions

### Critical Bugs Fixed
1. **Messages Disappearing**: Fixed user ID consistency across API calls
2. **Duplicate Messages**: Eliminated double-saving during streaming
3. **Message Ordering**: Standardized timestamp formats
4. **Auto-Session Creation**: Removed unwanted session creation on reload
5. **Context Display**: Separated user display from AI context

### Current Limitations
- **Simulated Signatures**: Using mock signatures instead of real wallet signatures
- **Mock Blockchain**: Some blockchain operations are simulated for development
- **Limited Memory Categories**: Basic categorization system needs expansion

## 🔮 Future Enhancements

### Planned Features
- **Real Wallet Signatures**: Implement actual Sui wallet signing
- **Advanced Memory Classification**: More sophisticated NLP categorization
- **Performance Optimization**: Implement comprehensive caching strategies
- **Enhanced UI**: More visual feedback and loading states
- **Comprehensive Testing**: Full test suite for all components

### Scalability Improvements
- **Database Migration**: Move from file-based to proper database
- **Microservices**: Split backend into specialized services
- **CDN Integration**: Optimize asset delivery
- **Load Balancing**: Handle multiple concurrent users

This comprehensive index serves as the definitive guide to understanding, developing, and maintaining the Personal Data Wallet system.
