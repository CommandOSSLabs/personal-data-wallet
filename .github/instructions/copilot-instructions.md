# GitHub Copilot Instructions for Personal Data Wallet

## Project Overview
The Personal Data Wallet is a decentralized application that securely stores user memories on the Sui blockchain using Walrus decentralized storage, with intelligent retrieval powered by multimodal vector embeddings and HNSW indexing. The system features end-to-end encryption via Mysten SEAL, knowledge graph relationships, and AI-powered memory extraction.

## Core Architecture Patterns

### 1. Hybrid Storage Architecture
- **Blockchain Layer (Sui)**: Memory metadata, access control policies, vector index references
- **Decentralized Storage (Walrus)**: Encrypted memory content, HNSW vector indices, knowledge graphs
- **Database (PostgreSQL)**: Chat sessions, messages, user preferences
- **In-Memory Caching**: Redis for performance optimization

### 2. Service Layer Architecture
```
Frontend (Next.js) ↔️ API Gateway ↔️ Backend Services (NestJS)
                                      ↙️        ↘️
Infrastructure Layer:   [SEAL] ←→ [Walrus] ←→ [Sui] ←→ [Gemini]
                       [Encryption] [Storage] [Blockchain] [AI/ML]
```

### 3. Memory Processing Pipeline
```
User Input → Classification → Embedding → Indexing → Graph Extraction → Encryption → Storage
     ↓            ↓            ↓         ↓           ↓            ↓         ↓
  Raw Text    AI Analysis  Vector Gen  HNSW Add  Entity Extract  SEAL IBE  Walrus Quilt
```

## Coding Conventions & Patterns

### Backend (NestJS/TypeScript)

#### Service Patterns
```typescript
@Injectable()
export class MemoryIngestionService {
  private readonly logger = new Logger(MemoryIngestionService.name);

  constructor(
    private classifierService: ClassifierService,
    private embeddingService: EmbeddingService,
    // ... other dependencies
  ) {}

  async processNewMemory(memoryDto: CreateMemoryDto): Promise<ProcessingResult> {
    try {
      // 1. Input validation
      // 2. Business logic processing
      // 3. Error handling with detailed logging
      // 4. Return structured result object

      return { success: true, data: result };
    } catch (error) {
      this.logger.error(`Error processing memory: ${error.message}`);
      return { success: false, message: error.message };
    }
  }
}
```

#### Error Handling Patterns
```typescript
// Always use structured error responses
return {
  success: false,
  message: `Failed to process memory: ${error.message}`
};

// Log errors with context
this.logger.error(`Error in ${methodName}: ${error.message}`, {
  userAddress,
  memoryId,
  error: error.stack
});
```

#### Configuration Management
```typescript
// Use ConfigService for all configuration
constructor(private configService: ConfigService) {}

private isDemoMode(): boolean {
  return this.configService.get<boolean>('USE_DEMO_STORAGE', true) ||
         this.configService.get<string>('NODE_ENV') === 'demo';
}
```

### Frontend (Next.js/React/TypeScript)

#### Component Patterns
```tsx
'use client'

interface MemoryPanelProps {
  userAddress: string
  sessionId?: string
}

export function MemoryPanel({ userAddress, sessionId }: MemoryPanelProps) {
  const [state, setState] = useState(initialState);
  const [loading, setLoading] = useState(false);

  // Effect for data loading
  useEffect(() => {
    if (userAddress) {
      loadData();
    }
  }, [userAddress]);

  // Effect for periodic refresh
  useEffect(() => {
    const interval = setInterval(refreshData, 10000);
    return () => clearInterval(interval);
  }, [userAddress]);

  // Event handling
  useEffect(() => {
    const handleEvent = (data) => refreshData();
    eventEmitter.on('eventName', handleEvent);
    return () => eventEmitter.off('eventName', handleEvent);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await apiCall();
      if (result.success) {
        setState(result.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading ? <Loader /> : <ComponentContent />}
    </div>
  );
}
```

#### API Integration Patterns
```typescript
// Service layer for API calls
export const memoryIntegrationService = {
  async getUserMemories(userAddress: string) {
    const response = await fetch(`/api/memories?user=${userAddress}`);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch memories');
    }

    return result.memories;
  },

  async searchMemories(query: string, userAddress: string) {
    const response = await fetch('/api/memories/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, userAddress })
    });

    return response.json();
  }
};
```

## Unique Project Patterns

### 1. SEAL Integration Patterns

#### Move Contract Patterns

##### Allowlist Access Control
```move
// allowlist.move - Based on official SEAL examples
module memory_wallet::allowlist {
    use std::string::String;
    use sui::dynamic_field as df;
    
    const EInvalidCap: u64 = 0;
    const ENoAccess: u64 = 1;
    const MARKER: u64 = 3;
    
    public struct Allowlist has key {
        id: UID,
        name: String,
        list: vector<address>,
    }
    
    public struct Cap has key {
        id: UID,
        allowlist_id: ID,
    }
    
    // Create allowlist with admin capabilities
    public fun create_allowlist(name: String, ctx: &mut TxContext): Cap {
        let allowlist = Allowlist {
            id: object::new(ctx),
            list: vector::empty(),
            name,
        };
        let cap = Cap {
            id: object::new(ctx),
            allowlist_id: object::id(&allowlist),
        };
        transfer::share_object(allowlist);
        cap
    }
    
    // Add member to allowlist
    public fun add(allowlist: &mut Allowlist, cap: &Cap, account: address) {
        assert!(cap.allowlist_id == object::id(allowlist), EInvalidCap);
        assert!(!allowlist.list.contains(&account), EDuplicate);
        allowlist.list.push_back(account);
    }
    
    // SEAL approve function - core access control
    entry fun seal_approve(id: vector<u8>, allowlist: &Allowlist, ctx: &TxContext) {
        assert!(approve_internal(ctx.sender(), id, allowlist), ENoAccess);
    }
    
    // Internal approval logic
    fun approve_internal(caller: address, id: vector<u8>, allowlist: &Allowlist): bool {
        // Check if id has correct allowlist prefix
        let namespace = allowlist.id.to_bytes();
        if (!is_prefix(namespace, id)) {
            return false
        };
        // Verify caller is in allowlist
        allowlist.list.contains(&caller)
    }
}
```

##### Time-Lock Encryption Pattern
```move
// Time-locked access pattern
module memory_wallet::timelock {
    use sui::{bcs::{Self, BCS}, clock};
    
    const ENoAccess: u64 = 77;
    
    // Key format: [pkg id][bcs::to_bytes(unlock_time)]
    entry fun seal_approve(id: vector<u8>, c: &clock::Clock) {
        let mut prepared: BCS = bcs::new(id);
        let unlock_time = prepared.peel_u64();
        let leftovers = prepared.into_remainder_bytes();
        
        // Check time has passed and identity fully consumed
        assert!(
            leftovers.length() == 0 && c.timestamp_ms() >= unlock_time,
            ENoAccess
        );
    }
}
```

#### TypeScript SDK Usage Patterns

##### Client Setup with Session Keys
```typescript
import { SealClient, SessionKey } from '@mysten/seal';
import { Transaction } from '@mysten/sui/transactions';
import { fromHex } from '@mysten/sui/utils';

class SealService {
  private sealClient: SealClient;
  private sessionKeys = new Map<string, SessionKey>();
  
  constructor(suiClient: SuiClient) {
    // Use official testnet key servers
    const serverObjectIds = [
      "0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75",
      "0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8"
    ];
    
    this.sealClient = new SealClient({
      suiClient,
      serverConfigs: serverObjectIds.map(id => ({
        objectId: id,
        weight: 1,
      })),
      verifyKeyServers: false, // Set to true in production
    });
  }
  
  // Get or create session key for user
  async getSessionKey(
    userAddress: string,
    packageId: string,
    mvrName?: string
  ): Promise<SessionKey> {
    const keyId = `${userAddress}-${packageId}`;
    
    if (this.sessionKeys.has(keyId)) {
      const sessionKey = this.sessionKeys.get(keyId)!;
      if (!sessionKey.isExpired()) {
        return sessionKey;
      }
    }
    
    // Create new session key
    const sessionKey = await SessionKey.create({
      address: userAddress,
      packageId,
      ttlMin: 10, // 10 minutes
      suiClient: this.suiClient,
      mvrName,
    });
    
    this.sessionKeys.set(keyId, sessionKey);
    return sessionKey;
  }
  
  // Encrypt with identity-based encryption
  async encryptContent(content: Uint8Array, identity: string): Promise<Uint8Array> {
    return await this.sealClient.encrypt(content, identity);
  }
  
  // Decrypt with access control transaction
  async decryptWithAllowlist(
    encryptedData: Uint8Array,
    identity: string,
    allowlistId: string,
    sessionKey: SessionKey
  ): Promise<Uint8Array> {
    const tx = new Transaction();
    tx.moveCall({
      target: `${this.packageId}::allowlist::seal_approve`,
      arguments: [
        tx.pure.vector('u8', fromHex(identity)),
        tx.object(allowlistId)
      ],
    });
    
    const txBytes = tx.build({ 
      client: this.suiClient, 
      onlyTransactionKind: true 
    });
    
    return await this.sealClient.decrypt({
      data: encryptedData,
      sessionKey,
      txBytes,
    });
  }
  
  // Decrypt with time-lock
  async decryptTimelock(
    encryptedData: Uint8Array,
    identity: string,
    sessionKey: SessionKey
  ): Promise<Uint8Array> {
    const tx = new Transaction();
    tx.moveCall({
      target: `${this.packageId}::timelock::seal_approve`,
      arguments: [
        tx.pure.vector('u8', fromHex(identity)),
        tx.object('0x6'), // SUI_CLOCK_OBJECT_ID
      ],
    });
    
    const txBytes = tx.build({ 
      client: this.suiClient, 
      onlyTransactionKind: true 
    });
    
    return await this.sealClient.decrypt({
      data: encryptedData,
      sessionKey,
      txBytes,
    });
  }
}
```

##### Frontend Integration with Personal Message Signing
```typescript
// React component pattern for SEAL decryption
export function MemoryDecryption({ memoryId, userAddress }: Props) {
  const { mutate: signPersonalMessage } = useSignPersonalMessage();
  const [sessionKey, setSessionKey] = useState<SessionKey | null>(null);
  
  const handleDecrypt = async () => {
    try {
      // Try to load existing session key
      const stored = await get('sessionKey');
      let currentSessionKey: SessionKey | null = null;
      
      if (stored) {
        currentSessionKey = await SessionKey.import(stored, suiClient);
        if (currentSessionKey.isExpired() || 
            currentSessionKey.getAddress() !== userAddress) {
          currentSessionKey = null;
        }
      }
      
      if (!currentSessionKey) {
        // Create new session key
        currentSessionKey = await SessionKey.create({
          address: userAddress,
          packageId: PACKAGE_ID,
          ttlMin: 10,
          suiClient,
        });
        
        // Sign personal message for authorization
        await new Promise((resolve, reject) => {
          signPersonalMessage(
            { message: currentSessionKey!.getPersonalMessage() },
            {
              onSuccess: async (result: { signature: string }) => {
                await currentSessionKey!.setPersonalMessageSignature(result.signature);
                await set('sessionKey', currentSessionKey!.export());
                resolve(result);
              },
              onError: reject
            }
          );
        });
      }
      
      setSessionKey(currentSessionKey);
      
      // Now decrypt with session key
      const decrypted = await sealService.decryptWithAllowlist(
        encryptedMemory,
        memoryId,
        allowlistId,
        currentSessionKey
      );
      
      // Process decrypted content...
      
    } catch (error) {
      console.error('Decryption failed:', error);
      if (error instanceof NoAccessError) {
        setError('You do not have permission to access this memory');
      }
    }
  };
  
  return (
    <Button onClick={handleDecrypt}>
      Decrypt Memory
    </Button>
  );
}
```

### 2. Walrus Storage Patterns

#### Quilt Batching for Efficiency
```typescript
// Batch multiple memories for cost efficiency
const quiltId = await this.quiltBatchService.batchMemories(
  memoryBatch,
  category
);

// Store individual files when needed
const blobId = await this.walrusService.uploadContent(
  content,
  userAddress
);
```

#### Cached Retrieval Pattern
```typescript
// Always use cached service for performance
const content = await this.cachedWalrusService.retrieveContent(blobId);
```

### 3. Vector Indexing Patterns

#### Batched Vector Addition
```typescript
// Add vectors to batch queue for efficiency
this.hnswIndexService.addVectorToIndexBatched(
  userAddress,
  vectorId,
  vector
);

// Force flush when needed
await this.hnswIndexService.forceFlush(userAddress);
```

#### Multimodal Search
```typescript
// Text-based search
const textResults = await this.hnswIndexService.searchMultimodal(
  queryText,
  'text',
  k
);

// Image-based search (future)
const imageResults = await this.hnswIndexService.searchMultimodal(
  imageBytes,
  'image',
  k
);
```

### 4. Knowledge Graph Patterns

#### Entity Extraction and Storage
```typescript
// Extract entities from content
const extraction = await this.graphService.extractEntitiesAndRelationships(
  content
);

// Update graph with new entities
const updatedGraph = this.graphService.addToGraph(
  existingGraph,
  extraction.entities,
  extraction.relationships
);
```

#### Graph-Enhanced Search
```typescript
// Find related entities via graph traversal
const relatedEntities = this.graphService.findRelatedEntities(
  graph,
  seedEntityIds,
  entityToVectorMap,
  maxHops
);
```

### 5. Sui Blockchain Integration

#### Memory Record Creation
```typescript
// Create memory record on blockchain
const memoryObject = await this.suiService.createMemory({
  content: encryptedContent,
  category,
  userAddress,
  vectorId,
  blobId
});
```

#### Index Management
```typescript
// Get or create memory index for user
const memoryIndex = await this.suiService.getOrCreateMemoryIndex(
  userAddress
);
```

## AI/ML Integration Patterns

### Gemini Service Usage
```typescript
// Generate content with conversation context
const response = await this.geminiService.generateContent(
  'gemini-2.0-flash',
  history,
  systemPrompt
);

// Create embeddings for vector search
const { vector } = await this.embeddingService.embedText(content);

// Classify memory content
const classification = await this.classifierService.shouldSaveMemory(
  conversation
);
```

### Prompt Engineering Patterns
```typescript
// Structured prompts for consistent results
const classificationPrompt = `
Analyze the message for personal information worth saving.
Categories: personal_info, preference, location, career, contact
Output JSON with: shouldSave, confidence, category, reasoning
`;

// Context-aware prompts
const contextPrompt = `
Based on user's memories, provide relevant context for: ${query}
Focus on: ${relevantTopics}
`;
```

## Security & Privacy Patterns

### 1. User-Specific Encryption
```typescript
// Always encrypt with user-specific keys
const encrypted = await this.sealService.encrypt(
  content,
  userAddress // User address as encryption key identifier
);
```

### 2. Access Control Validation
```typescript
// Validate ownership before operations
const memory = await this.suiService.getMemory(memoryId);
if (memory.owner !== userAddress) {
  throw new Error('Access denied: not the owner');
}
```

### 3. Secure Key Management
```typescript
// Use session keys for SEAL operations
const sessionKey = await this.sessionKeyManager.getOrCreateSessionKey(
  userAddress,
  packageId
);
```

## Testing Patterns

### Unit Test Structure
```typescript
describe('MemoryIngestionService', () => {
  let service: MemoryIngestionService;
  let mockClassifier: jest.Mocked<ClassifierService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MemoryIngestionService,
        {
          provide: ClassifierService,
          useValue: {
            shouldSaveMemory: jest.fn()
          }
        }
      ]
    }).compile();

    service = module.get(MemoryIngestionService);
    mockClassifier = module.get(ClassifierService);
  });

  describe('processNewMemory', () => {
    it('should process memory successfully', async () => {
      // Arrange
      mockClassifier.shouldSaveMemory.mockResolvedValue({
        shouldSave: true,
        confidence: 0.9,
        category: 'personal'
      });

      // Act
      const result = await service.processNewMemory({
        content: 'Test memory',
        category: 'personal',
        userAddress: '0x123...'
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.memoryId).toBeDefined();
    });
  });
});
```

### Integration Test Patterns
```typescript
describe('Memory Pipeline Integration', () => {
  it('should process memory end-to-end', async () => {
    // 1. Create memory via API
    // 2. Verify blockchain record
    // 3. Verify Walrus storage
    // 4. Verify vector indexing
    // 5. Test search retrieval
  });
});
```

## Deployment & Configuration

### Environment Variables
```bash
# AI/ML
GOOGLE_API_KEY=your_gemini_api_key

# Blockchain
SUI_NETWORK=testnet
SUI_PRIVATE_KEY=your_private_key

# Storage
WALRUS_AGGREGATOR=https://aggregator.walrus-testnet.walrus.space

# Encryption
SEAL_PACKAGE_ID=0x... # Deployed SEAL package
SEAL_KEY_SERVER_1_OBJECT_ID=0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75
SEAL_KEY_SERVER_1_URL=https://seal-key-server-testnet-1.mystenlabs.com
SEAL_KEY_SERVER_2_OBJECT_ID=0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8
SEAL_KEY_SERVER_2_URL=https://seal-key-server-testnet-2.mystenlabs.com

# Database
DATABASE_URL=postgresql://...

# Features
USE_DEMO_STORAGE=false
ENABLE_ENCRYPTION=true
```

### Docker Configuration
```yaml
# Use multi-stage builds for optimization
FROM node:18-alpine AS builder
# Build stage

FROM node:18-alpine AS runtime
# Runtime stage with minimal dependencies
```

## Common Implementation Patterns

### 1. Async Error Handling
```typescript
try {
  const result = await asyncOperation();
  return { success: true, data: result };
} catch (error) {
  this.logger.error(`Operation failed: ${error.message}`);
  return { success: false, message: error.message };
}
```

### 2. Batch Processing
```typescript
// Implement batching for efficiency
private batchQueue: T[] = [];
private batchTimer: NodeJS.Timeout;

private addToBatch(item: T): void {
  this.batchQueue.push(item);

  if (this.batchQueue.length >= BATCH_SIZE) {
    this.processBatch();
  } else if (!this.batchTimer) {
    this.batchTimer = setTimeout(() => this.processBatch(), BATCH_DELAY);
  }
}
```

### 3. Caching Strategy
```typescript
// Implement multi-level caching
private l1Cache = new Map(); // In-memory
private l2Cache: Redis;      // Redis
private l3Storage: Walrus;   // Persistent

async getCachedData(key: string): Promise<T> {
  // Check L1 cache first
  if (this.l1Cache.has(key)) {
    return this.l1Cache.get(key);
  }

  // Check L2 cache
  const l2Data = await this.l2Cache.get(key);
  if (l2Data) {
    this.l1Cache.set(key, l2Data); // Promote to L1
    return l2Data;
  }

  // Fetch from L3 and cache
  const data = await this.l3Storage.get(key);
  await this.l2Cache.set(key, data);
  this.l1Cache.set(key, data);

  return data;
}
```

### 4. Event-Driven Architecture
```typescript
// Use event emitters for loose coupling
export const memoryEventEmitter = new EventEmitter();

class MemoryService {
  async createMemory(memoryData: CreateMemoryDto) {
    // Create memory logic...

    // Emit event for other components
    memoryEventEmitter.emit('memoryCreated', {
      memoryId: result.id,
      userAddress: memoryData.userAddress
    });
  }
}

// Subscribe to events in components
useEffect(() => {
  const handleMemoryCreated = (data) => {
    // Refresh UI or update state
    refreshMemories();
  };

  memoryEventEmitter.on('memoryCreated', handleMemoryCreated);
  return () => memoryEventEmitter.off('memoryCreated', handleMemoryCreated);
}, []);
```

## Package Usage Guidelines

### Latest Package Versions (Always Check)
- `@mysten/sui`: Latest (avoid old `@mysten/sui.js`)
- `@mysten/seal`: 0.5.2+ (SEAL SDK for encryption)
- `@mysten/walrus`: 0.6.4+ (Walrus SDK for storage)
- `@mysten/bcs`: Latest (Binary Canonical Serialization)
- `@mysten/sui/cryptography`: Latest (Cryptography utilities)
- `@mysten/sui/transactions`: Latest (Transaction building)
- `@mysten/sui/client`: Latest (RPC client)

### Package-Specific Patterns

#### Sui Client Usage
```typescript
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';

const client = new SuiClient({
  url: getFullnodeUrl('testnet')
});

// Always handle errors
try {
  const result = await client.getObject({ id: objectId });
} catch (error) {
  this.logger.error(`Sui client error: ${error.message}`);
}
```

#### Walrus SDK Usage
```typescript
import { WalrusClient } from '@mysten/walrus';

const walrusClient = new WalrusClient({
  network: 'testnet',
  suiClient
});

// Use retry logic for reliability
const result = await this.handleRetryableError(
  () => walrusClient.readBlob({ blobId }),
  3 // max retries
);
```

#### SEAL SDK Usage
```typescript
import { SealClient, SessionKey, NoAccessError, type ExportedSessionKey } from '@mysten/seal';
import { set, get } from 'idb-keyval'; // For session key persistence

// SEAL Key Server Configuration (Testnet)
const keyServerConfigs = [
  {
    objectId: '0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75',
    url: 'https://seal-key-server-testnet-1.mystenlabs.com',
    mode: 'Open'
  },
  {
    objectId: '0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8',
    url: 'https://seal-key-server-testnet-2.mystenlabs.com',
    mode: 'Open'
  }
];

// Initialize SEAL client
const sealClient = new SealClient({
  suiClient,
  serverConfigs: keyServerConfigs.map(config => ({
    objectId: config.objectId,
    weight: 1, // Equal weight for all servers
  })),
  verifyKeyServers: false, // Set to true in production
});

// Advanced encryption with identity namespacing
async function encryptMemoryContent(
  content: string,
  memoryCategory: string,
  userAddress: string
): Promise<{ encrypted: Uint8Array; identity: string }> {
  // Create namespaced identity: [category][user_address][timestamp]
  const timestamp = Date.now();
  const identity = `${memoryCategory}_${userAddress}_${timestamp}`;
  
  try {
    const encrypted = await sealClient.encrypt(
      new TextEncoder().encode(content),
      identity
    );
    
    return { encrypted, identity };
  } catch (error) {
    console.error('SEAL encryption failed:', error);
    throw new Error(`Failed to encrypt memory: ${error.message}`);
  }
}

// Session key management with persistence
class SessionKeyManager {
  private static readonly STORAGE_KEY = 'seal_session_keys';
  private keys = new Map<string, SessionKey>();
  
  async getOrCreateSessionKey(
    userAddress: string,
    packageId: string,
    mvrName?: string
  ): Promise<SessionKey> {
    const keyId = `${userAddress}_${packageId}`;
    
    // Check memory cache first
    if (this.keys.has(keyId)) {
      const sessionKey = this.keys.get(keyId)!;
      if (!sessionKey.isExpired()) {
        return sessionKey;
      }
    }
    
    // Try to load from IndexedDB
    try {
      const stored: ExportedSessionKey = await get(`${SessionKeyManager.STORAGE_KEY}_${keyId}`);
      if (stored) {
        const sessionKey = await SessionKey.import(stored, suiClient);
        if (!sessionKey.isExpired() && sessionKey.getAddress() === userAddress) {
          this.keys.set(keyId, sessionKey);
          return sessionKey;
        }
      }
    } catch (error) {
      console.warn('Failed to load stored session key:', error);
    }
    
    // Create new session key
    const sessionKey = await SessionKey.create({
      address: userAddress,
      packageId,
      ttlMin: 10, // 10 minutes TTL
      suiClient,
      mvrName,
    });
    
    // Cache and persist
    this.keys.set(keyId, sessionKey);
    await set(`${SessionKeyManager.STORAGE_KEY}_${keyId}`, sessionKey.export());
    
    return sessionKey;
  }
  
  async clearExpiredKeys(): Promise<void> {
    for (const [keyId, sessionKey] of this.keys.entries()) {
      if (sessionKey.isExpired()) {
        this.keys.delete(keyId);
        await set(`${SessionKeyManager.STORAGE_KEY}_${keyId}`, null);
      }
    }
  }
}

// Comprehensive error handling patterns
async function safeDecrypt(
  encryptedData: Uint8Array,
  identity: string,
  accessTransaction: Transaction,
  sessionKey: SessionKey
): Promise<Uint8Array | null> {
  try {
    const txBytes = accessTransaction.build({ 
      client: suiClient, 
      onlyTransactionKind: true 
    });
    
    const decrypted = await sealClient.decrypt({
      data: encryptedData,
      sessionKey,
      txBytes,
    });
    
    return decrypted;
  } catch (error) {
    if (error instanceof NoAccessError) {
      console.warn('Access denied for identity:', identity);
      return null;
    } else if (error.message.includes('session key expired')) {
      console.warn('Session key expired, need to refresh');
      throw new Error('SESSION_EXPIRED');
    } else if (error.message.includes('key server unavailable')) {
      console.warn('Key server unavailable, retrying...');
      // Implement retry logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      return safeDecrypt(encryptedData, identity, accessTransaction, sessionKey);
    } else {
      console.error('Unexpected decryption error:', error);
      throw error;
    }
  }
}
```

## Documentation & Comments

### Code Documentation Standards
```typescript
/**
 * Processes a new memory through the complete pipeline
 * @param memoryDto Memory creation data
 * @returns Processing result with success status and data
 *
 * Pipeline steps:
 * 1. Classify content for memory worthiness
 * 2. Generate vector embedding
 * 3. Add to HNSW index (batched)
 * 4. Extract entities for knowledge graph
 * 5. Encrypt content (if not demo mode)
 * 6. Store in Walrus
 * 7. Return processing metadata
 */
async processNewMemory(memoryDto: CreateMemoryDto): Promise<ProcessingResult> {
  // Implementation with detailed inline comments
}
```

### Architecture Decision Records
```markdown
# ADR: Hybrid Storage Architecture

## Context
Need to balance decentralization, performance, and cost

## Decision
- Blockchain: Metadata and access control
- Walrus: Content and indices
- PostgreSQL: Operational data
- Redis: Caching layer

## Consequences
- Decentralized storage with good performance
- Complex multi-system coordination
- Higher development complexity
```

## Performance Optimization Patterns

### 1. Batch Processing Strategy
```typescript
// Batch vector additions for efficiency
const BATCH_SIZE = 50;
const BATCH_DELAY_MS = 5000;

class BatchProcessor {
  private queue: VectorData[] = [];

  addToBatch(vectorData: VectorData): void {
    this.queue.push(vectorData);

    if (this.queue.length >= BATCH_SIZE) {
      this.flushBatch();
    }
  }

  private async flushBatch(): Promise<void> {
    if (this.queue.length === 0) return;

    // Process all queued items efficiently
    await this.vectorIndex.addBatch(this.queue);
    this.queue = [];
  }
}
```

### 2. Caching Hierarchy
```typescript
// L1: In-memory (fastest, smallest)
private memoryCache = new Map<string, any>();

// L2: Redis (medium speed, medium size)
private redisCache: Redis;

// L3: Walrus (slowest, largest)
private walrusStorage: WalrusService;

async getWithCaching(key: string): Promise<any> {
  // Check caches in order of speed
  let data = this.memoryCache.get(key);
  if (data) return data;

  data = await this.redisCache.get(key);
  if (data) {
    this.memoryCache.set(key, data); // Promote to L1
    return data;
  }

  data = await this.walrusStorage.get(key);
  await this.redisCache.set(key, data);
  this.memoryCache.set(key, data);

  return data;
}
```

### 3. Lazy Loading Pattern
```typescript
// Load expensive resources only when needed
private indexCache = new Map<string, HNSWIndex>();

async getIndex(userAddress: string): Promise<HNSWIndex> {
  if (this.indexCache.has(userAddress)) {
    return this.indexCache.get(userAddress);
  }

  // Load from Walrus only when first accessed
  const index = await this.loadIndexFromWalrus(userAddress);
  this.indexCache.set(userAddress, index);

  return index;
}
```

## Migration & Compatibility

### Demo Mode Pattern
```typescript
// Support both demo and production modes
private isDemoMode(): boolean {
  return this.configService.get<boolean>('USE_DEMO_STORAGE', true);
}

// Conditional logic based on mode
if (this.isDemoMode()) {
  // Use simplified/demo implementation
  contentToStore = memoryDto.content;
} else {
  // Use full production implementation
  contentToStore = await this.sealService.encrypt(memoryDto.content, userAddress);
}
```

### Backward Compatibility
```typescript
// Support legacy API formats
async legacyEndpoint(data: LegacyFormat) {
  // Convert to new format
  const newFormat = this.convertLegacyFormat(data);

  // Use new implementation
  return this.newImplementation(newFormat);
}
```

## Security Best Practices

### 1. Input Validation
```typescript
// Always validate user inputs
const validatedAddress = this.validateSuiAddress(userAddress);
if (!validatedAddress) {
  throw new Error('Invalid Sui address format');
}
```

### 2. Access Control
```typescript
// Verify ownership before operations
const memory = await this.suiService.getMemory(memoryId);
if (memory.owner !== userAddress) {
  throw new Error('Access denied');
}
```

### 3. Secure Key Handling
```typescript
// Never log sensitive keys
this.logger.debug('Processing memory', {
  memoryId,
  userAddress,
  // Never include: privateKey, sessionKey, encrypted content
});
```

## Monitoring & Observability

### Logging Patterns
```typescript
// Structured logging with context
this.logger.info('Memory processed successfully', {
  memoryId,
  userAddress,
  processingTimeMs: endTime - startTime,
  vectorId,
  blobId
});

// Error logging with full context
this.logger.error('Memory processing failed', {
  error: error.message,
  stack: error.stack,
  memoryId,
  userAddress,
  contentLength: content?.length
});
```

### Metrics Collection
```typescript
// Performance metrics
const processingStart = Date.now();
// ... processing logic ...
this.metrics.record('memory.processing.duration', Date.now() - processingStart);

// Business metrics
this.metrics.increment('memory.created', { category, userAddress });

// Error metrics
this.metrics.increment('memory.processing.error', {
  errorType: error.constructor.name
});
```

## Development Workflow

### 1. Feature Development
```bash
# 1. Create feature branch
git checkout -b feature/new-memory-feature

# 2. Implement with tests
npm run test:watch

# 3. Update documentation
# 4. Create PR with detailed description
```

### 2. Code Review Checklist
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Security review completed
- [ ] Performance impact assessed
- [ ] Backward compatibility maintained

### 3. Deployment Process
```bash
# 1. Run full test suite
npm run test:ci

# 2. Build production artifacts
npm run build

# 3. Deploy to staging
# 4. Run integration tests
# 5. Deploy to production
```

This comprehensive guide ensures AI agents can effectively contribute to the Personal Data Wallet project while maintaining code quality, security, and architectural consistency.