# Chat Module - PostgreSQL Implementation

This module has been refactored to use PostgreSQL as the primary storage for chat sessions and messages, removing the hybrid blockchain/database approach for cleaner and more consistent data management.

## Overview

The chat module now exclusively uses PostgreSQL to store:
- Chat sessions with metadata
- Chat messages with role-based conversation history
- Session summaries
- Memory extraction metadata

## Key Changes

### 1. Database-First Approach
- All chat data is stored in PostgreSQL tables (`chat_session` and `chat_message`)
- Removed blockchain fallback logic for cleaner code
- Sessions can still reference blockchain objects via `suiObjectId` for compatibility

### 2. Entity Structure

#### ChatSession Entity
- `id`: Primary key (UUID or blockchain object ID)
- `title`: Session title
- `summary`: AI-generated summary
- `userAddress`: Owner's wallet address
- `suiObjectId`: Optional reference to blockchain object
- `isArchived`: Soft delete flag
- `metadata`: JSONB field for flexible data storage
- `createdAt` / `updatedAt`: Timestamps

#### ChatMessage Entity
- `id`: UUID primary key
- `role`: Message role ('user' or 'assistant')
- `content`: Message text
- `memoryId`: Optional reference to stored memory
- `walrusHash`: Optional reference to decentralized storage
- `metadata`: JSONB field for additional data
- `sessionId`: Foreign key to chat session
- `createdAt`: Message timestamp

### 3. API Endpoints

- `GET /chat/sessions` - Get all sessions for a user
- `GET /chat/sessions/:sessionId` - Get specific session with messages
- `POST /chat/sessions` - Create new session
- `POST /chat/sessions/:sessionId/messages` - Add message to session
- `DELETE /chat/sessions/:sessionId` - Delete session
- `PUT /chat/sessions/:sessionId/title` - Update session title
- `POST /chat/summary` - Save session summary
- `POST /chat/stream` - Stream chat responses (SSE)
- `POST /chat` - Send non-streaming chat message

### 4. Features

#### Session Management
- Create sessions with optional blockchain reference
- List user's sessions with message counts
- Update session titles
- Soft delete with archiving support

#### Message Handling
- Store user and assistant messages
- Support for memory extraction metadata
- Integration with decentralized storage (Walrus)
- Ordered message history retrieval

#### AI Integration
- Streaming responses using Server-Sent Events
- Memory context injection
- Session summarization
- Automatic memory extraction detection

### 5. Database Schema

```sql
-- Chat session table
CREATE TABLE chat_session (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    "userAddress" VARCHAR(255) NOT NULL,
    "suiObjectId" VARCHAR(255),
    "isArchived" BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat message table
CREATE TABLE chat_message (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    "memoryId" VARCHAR(255),
    "walrusHash" VARCHAR(255),
    metadata JSONB,
    "sessionId" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("sessionId") REFERENCES chat_session(id) ON DELETE CASCADE
);
```

### 6. Usage Example

```typescript
// Create a new session
const session = await chatApi.createSession({
  userAddress: '0x123...',
  title: 'My Chat',
  modelName: 'gemini-2.0-flash',
  suiObjectId: '0xabc...' // Optional blockchain reference
});

// Add messages
await chatApi.addMessage(session.id, {
  userAddress: '0x123...',
  content: 'Hello AI!',
  type: 'user'
});

// Stream chat response
const response = await chatApi.streamChat({
  text: 'Tell me about...',
  user_id: '0x123...',
  session_id: session.id,
  model: 'gemini-2.0-flash'
});
```

## Migration Notes

1. Run the migration script in `/backend/src/database/migrations/create-chat-tables.sql`
2. Existing blockchain sessions can be imported using their object IDs
3. The `suiObjectId` field maintains compatibility with blockchain-created sessions
4. Frontend can continue to create blockchain sessions and sync them to the database

## Benefits of PostgreSQL-Only Approach

1. **Performance**: Faster queries without blockchain network latency
2. **Consistency**: Single source of truth for chat data
3. **Features**: Full SQL capabilities for complex queries
4. **Scalability**: Standard database scaling techniques apply
5. **Cost**: No blockchain transaction fees for chat operations
6. **Flexibility**: Easy schema migrations and updates

## Future Enhancements

1. Full-text search on chat messages
2. Analytics and usage statistics
3. Message reactions and metadata
4. Conversation threading
5. Export/import functionality
