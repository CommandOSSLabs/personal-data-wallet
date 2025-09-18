# Personal Data Wallet - AI Coding Assistant Instructions

## Architecture Overview

Personal Data Wallet is a **decentralized memory system** combining:
- **Next.js Frontend** with Sui wallet integration
- **NestJS Backend** orchestrating all business logic 
- **Sui Blockchain** for ownership/metadata records
- **Walrus Storage** for encrypted content and vector indices
- **SEAL Encryption** for privacy-preserving memory storage

### Key Data Flow
```
User Memory → AI Classification → SEAL Encryption → Walrus Storage → 
Sui Blockchain Record → HNSW Index Update → Knowledge Graph Update
```

## Critical Architecture Patterns

### 1. Service Injection Architecture (Backend)
All backend services use NestJS dependency injection with this pattern:
```typescript
@Injectable()
export class ExampleService {
  private logger = new Logger(ExampleService.name);
  
  constructor(
    private configService: ConfigService,
    private suiService: SuiService,
    private walrusService: WalrusService
  ) {}
}
```

### 2. Hybrid Storage Strategy
- **Memories**: SEAL-encrypted → Walrus (decentralized) + Sui records
- **Chat Sessions**: PostgreSQL (traditional database)
- **Vector Indices**: HNSW format in Walrus, managed by backend
- **Knowledge Graphs**: JSON files in Walrus

### 3. Memory Processing Pipeline
In `backend/src/memory/memory-ingestion/`, follow this exact sequence:
1. AI classification (Gemini API)
2. Embedding generation (if factual content)
3. SEAL encryption of content
4. Walrus upload (returns blobId)
5. Sui blockchain record creation
6. HNSW index update
7. Knowledge graph expansion

### 4. Frontend State Management
Use React Query for server state with this pattern:
```typescript
// In hooks/
const { data, error, isLoading } = useQuery({
  queryKey: ['memories', userAddress],
  queryFn: () => memoryApi.getUserMemories(userAddress)
});
```

## Development Workflows

### Environment Setup
1. **Backend Environment**:
   - **Windows**: `copy backend\.env.example backend\.env`
   - **Linux/macOS**: `cp backend/.env.example backend/.env`
2. **Required vars**: `SUI_PACKAGE_ID`, `SUI_ADMIN_PRIVATE_KEY`, `GOOGLE_API_KEY`
3. **Start services**: 
   - **Backend**: `npm run backend` (port 3000)
   - **Frontend**: `npm run dev` (Next.js dev server)

### Smart Contract Integration
- **Package ID**: Must match deployed Move contracts in `smart-contract/`
- **Transaction pattern**: All Sui operations use `TransactionBlock` with `moveCall`
- **Event extraction**: Use `extractCreatedObjectId()` for new object IDs
- **Move Book**: https://move-book.com/ is the official Move language reference
- **Update latest package**: always review content on https://move-book.com/ first before implement to ensure the code is validate and up-to-date

### Memory System Testing
**Windows**:
```powershell
# Use PowerShell equivalent or run via WSL
scripts\test-system.sh  # If available for Windows
```

**Linux/macOS**:
```bash
scripts/test-system.sh
```

Verify:
- Memory ingestion pipeline
- Vector search functionality   
- Blockchain integration
- Walrus storage connectivity

## Project-Specific Conventions

### 1. Error Handling
Backend services always return structured responses:
```typescript
return { success: boolean, message?: string, data?: any }
```

### 2. Service Boundaries
- **MemoryIngestionService**: Processes new memories, handles encryption
- **MemoryQueryService**: Searches memories, manages decryption
- **SuiService**: All blockchain operations
- **WalrusService**: All decentralized storage operations

### 3. TypeScript Patterns
- DTOs in `dto/` folders for API contracts
- Shared types in `types/` directories
- Service interfaces consistently named `ServiceName`

### 4. Frontend Component Organization
```
app/
├── components/        # Reusable UI components
├── hooks/            # Custom React hooks
├── services/         # Frontend business logic
├── providers/        # React context providers
└── api/             # API client functions
```

## Essential File Locations

### Backend Core Services
- `backend/src/infrastructure/` - External service integrations
- `backend/src/memory/` - Memory processing logic
- `backend/src/chat/` - Chat streaming and session management

### Frontend Integration Points
- `app/services/suiBlockchainService.ts` - Blockchain operations
- `app/services/memoryIntegration.ts` - Memory CRUD operations
- `app/hooks/use-streaming-chat.ts` - Server-sent events handling

### Smart Contracts
- `smart-contract/sources/memory.move` - Memory record management
- `smart-contract/sources/seal_access_control.move` - Encryption access

## Common Integration Points

### Adding New Memory Types
1. Update `memory.move` with new category
2. Modify `EmbeddingService` classification logic
3. Extend frontend `MemoryType` enum
4. Update HNSW index categorization

### Extending Chat Features
1. Backend: Add endpoint in `chat/chat.controller.ts`
2. Frontend: Update `chatApi.ts` client
3. Add React Query hook in `hooks/`
4. Implement UI in `components/chat/`

### Blockchain Operations
Always follow this pattern in both frontend and backend:
```typescript
const tx = new TransactionBlock();
tx.moveCall({
  target: `${PACKAGE_ID}::memory::function_name`,
  arguments: [/* typed arguments */]
});
```

## Build & Deployment

### Local Development
- **Frontend**: `npm run dev` (Next.js dev server)
- **Backend**: `npm run start:dev` (NestJS watch mode)
- **Database**: Use Docker Compose for PostgreSQL

### Docker Deployment
- `docker-compose up -d` starts full stack
- Backend health: `http://localhost:3000/api/health`
- Frontend: `http://localhost:3000`

### Smart Contract Deployment
**Windows (PowerShell)**:
```powershell
cd smart-contract
sui client publish --gas-budget 50000000
# Update SUI_PACKAGE_ID in .env files
```

**Linux/macOS**:
```bash
cd smart-contract
sui client publish --gas-budget 50000000
# Update SUI_PACKAGE_ID in .env files
```

## Common Development Commands

### Windows PowerShell Commands
```powershell
# Build smart contracts
cd smart-contract; sui move build

# Check directory contents
dir  # or Get-ChildItem

# Navigate directories
cd path\to\directory

# Copy files
copy source destination

# Environment variables (temporary)
$env:VARIABLE_NAME = "value"

# Run backend
cd backend; npm run start:dev

# Run frontend
npm run dev
```

### Cross-Platform Node.js Commands
```bash
# Install dependencies
npm install

# Build contracts
sui move build

# Start development servers
npm run backend    # Backend (port 3000)
npm run dev       # Frontend (Next.js)
```

## Debugging Tips

1. **Memory Pipeline**: Check backend logs for SEAL encryption/decryption errors
2. **Blockchain**: Verify transaction digests in Sui Explorer
3. **Walrus**: Check blob IDs in network explorer
4. **Vector Search**: Examine HNSW index size and categories
5. **Chat Streaming**: Use browser DevTools to monitor EventSource connections
6. **Windows Debugging**: Use PowerShell ISE or VS Code terminal for better error visibility