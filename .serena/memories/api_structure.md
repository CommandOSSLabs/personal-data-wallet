# API Structure and Endpoints

## Base Configuration
- **Base URL**: `http://localhost:8000/api` (development)
- **Global Prefix**: `/api`
- **CORS**: Enabled for all origins
- **Validation**: Global validation pipe with whitelist

## Memory API Endpoints

### Create Memory
`POST /api/memories`
- Creates new memory on blockchain
- Processes embeddings
- Stores in HNSW index

### Get User Memories
`GET /api/memories?user={address}`
- Retrieves all memories for a user
- Returns memory list with metadata

### Get Specific Memory
`GET /api/memories/{id}?user={address}`
- Gets single memory by ID
- Includes full content and metadata

### Search Memories
`POST /api/memories/search`
- Vector similarity search
- Uses HNSW index for fast retrieval
- Returns relevant memories

### Update Memory
`POST /api/memories/{id}`
- Updates existing memory
- Re-processes embeddings

### Delete Memory
`DELETE /api/memories/{id}`
- Removes memory from blockchain
- Cleans up vector index

### Process Memory
`POST /api/memories/process`
- Processes memory without creating
- Returns processed data for preview

### Save Approved Memory
`POST /api/memories/save-approved`
- Saves pre-approved/processed memory
- Skips processing step

## Chat API Endpoints

### Create Session
`POST /api/chat/sessions`
- Creates new chat session
- Initializes session metadata

### Get User Sessions
`GET /api/chat/sessions?user={address}`
- Lists all sessions for user
- Includes session summaries

### Get Session Details
`GET /api/chat/sessions/{id}`
- Full session with messages
- Includes memory references

### Add Message
`POST /api/chat/sessions/{id}/messages`
- Adds message to session
- Processes AI response if needed

### Stream Chat
`POST /api/chat/stream`
- Server-sent events for streaming
- Real-time AI responses
- Memory context integration

### Delete Session
`DELETE /api/chat/sessions/{id}`
- Removes session and messages
- Maintains memory references

## Request/Response Patterns

### Authentication
- User wallet address in query params or body
- No traditional auth tokens (wallet-based)

### Error Handling
- Consistent error format
- HTTP status codes properly used
- Validation errors with details

### Data Transfer Objects (DTOs)
- Class-validator decorators
- Automatic transformation
- Whitelist enabled (strips unknown properties)

## Database Entities

### Chat Session
- id (UUID)
- title
- summary
- userAddress
- suiObjectId (blockchain ref)
- isArchived
- metadata (JSONB)
- timestamps

### Chat Message
- id (UUID)
- role (user/assistant)
- content
- sessionId (FK)
- memoryId (blockchain ref)
- walrusHash (storage ref)
- metadata (JSONB)
- createdAt

## Integration Points
- Sui blockchain for memory storage
- Walrus for decentralized storage
- Google AI for embeddings
- HNSW for vector search
- PostgreSQL for session data