# React Hooks Proposal for Personal Data Wallet SDK

## Overview

Creating React hooks for the PDW SDK will significantly improve developer experience by:
- **Reducing boilerplate**: No need to manually manage state, loading, and errors
- **Automatic integration**: Works seamlessly with @mysten/dapp-kit
- **Optimistic updates**: Better UX with loading states and optimistic UI
- **Caching**: Built-in React Query integration for data caching
- **TypeScript**: Full type safety and IntelliSense support

---

## 1. Core Hooks (Essential)

### `useMemoryManager(config?)`

Central hook that initializes and provides access to ClientMemoryManager instance.

**Purpose**: Single source of truth for memory operations, auto-configured from environment variables.

**API**:
```typescript
import { useMemoryManager } from 'personal-data-wallet-sdk/hooks';

function MyComponent() {
  const manager = useMemoryManager({
    packageId: process.env.NEXT_PUBLIC_PACKAGE_ID,
    // ... other config (optional, uses env vars by default)
  });

  return <div>Manager ready: {manager ? 'Yes' : 'No'}</div>;
}
```

**Features**:
- ✅ Memoized instance (stable reference)
- ✅ Auto-loads config from environment variables
- ✅ Returns null if wallet not connected
- ✅ TypeScript: Full config type safety

**Implementation Priority**: 🔥 **HIGH** - Foundation for other hooks

---

### `useCreateMemory()`

Hook for creating memories with automatic state management.

**Purpose**: Simplify memory creation with loading states, error handling, and optimistic updates.

**API**:
```typescript
import { useCreateMemory } from 'personal-data-wallet-sdk/hooks';

function MemoryCreator() {
  const { mutate: createMemory, isLoading, error, data } = useCreateMemory({
    onSuccess: (blobId) => {
      console.log('Memory created:', blobId);
    },
    onError: (error) => {
      console.error('Failed:', error);
    }
  });

  const handleCreate = () => {
    createMemory({
      content: 'I love TypeScript',
      category: 'personal'
    });
  };

  return (
    <button onClick={handleCreate} disabled={isLoading}>
      {isLoading ? 'Creating...' : 'Create Memory'}
    </button>
  );
}
```

**Features**:
- ✅ Automatic loading/error states
- ✅ Progress callbacks (7 stages)
- ✅ Optimistic updates
- ✅ Auto-retry on failure
- ✅ Invalidates memory cache on success
- ✅ Returns blobId and transaction digest

**State Machine**:
```
idle → analyzing → embedding → encrypting → uploading → registering → success/error
```

**Implementation Priority**: 🔥 **HIGH** - Most common operation

---

### `useSearchMemories(query, options?)`

Hook for searching memories with automatic caching and loading states.

**Purpose**: Vector search with intelligent caching and real-time updates.

**API**:
```typescript
import { useSearchMemories } from 'personal-data-wallet-sdk/hooks';

function MemorySearch() {
  const [query, setQuery] = useState('');

  const { data: results, isLoading, error, refetch } = useSearchMemories(query, {
    k: 5,
    minSimilarity: 0.7,
    enabled: query.length > 0, // Only search when query exists
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      {isLoading && <span>Searching...</span>}
      {results?.map((memory) => (
        <div key={memory.blobId}>
          {memory.content} (similarity: {memory.similarity.toFixed(2)})
        </div>
      ))}
    </div>
  );
}
```

**Features**:
- ✅ Automatic debouncing (500ms)
- ✅ React Query caching
- ✅ Stale-while-revalidate strategy
- ✅ Returns similarity scores
- ✅ Supports filters (category, date range)
- ✅ Pagination support

**Return Type**:
```typescript
{
  data: Array<{
    blobId: string;
    content: string;
    category: string;
    similarity: number;
    timestamp: Date;
  }>;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  hasNextPage: boolean;
  fetchNextPage: () => void;
}
```

**Implementation Priority**: 🔥 **HIGH** - Core search functionality

---

### `useMemoryChat()`

Complete memory-aware chat hook with context retrieval and AI integration.

**Purpose**: Drop-in solution for building memory-aware chatbots.

**API**:
```typescript
import { useMemoryChat } from 'personal-data-wallet-sdk/hooks';

function ChatInterface() {
  const {
    messages,
    sendMessage,
    createMemory,
    isProcessing,
    retrievedMemories
  } = useMemoryChat({
    systemPrompt: 'You are a helpful assistant with access to user memories.',
    maxContextMemories: 5,
    aiProvider: 'gemini' // or 'openai', 'anthropic'
  });

  return (
    <div>
      {messages.map((msg, i) => (
        <div key={i} className={msg.role}>
          {msg.content}
          {msg.memories && (
            <div className="context">
              Used {msg.memories.length} memories
            </div>
          )}
        </div>
      ))}

      <input
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            sendMessage(e.target.value);
          }
        }}
      />

      {/* Quick action: Create memory from message */}
      <button onClick={() => createMemory(lastUserMessage)}>
        💾 Remember this
      </button>
    </div>
  );
}
```

**Features**:
- ✅ Automatic context retrieval (top-K memories)
- ✅ Memory highlighting in responses
- ✅ Built-in AI provider support (Gemini, OpenAI, Anthropic)
- ✅ Streaming responses
- ✅ Message history management
- ✅ Quick memory creation from chat
- ✅ Shows which memories were used

**Chat Flow**:
```
1. User sends message
2. Generate embedding for message
3. Search top-K relevant memories
4. Inject memories into AI context
5. Get AI response with memory citations
6. Display response + which memories were used
```

**Implementation Priority**: 🔥 **CRITICAL** - Killer feature for the SDK

---

### `useWalletMemories(options?)`

Hook for fetching and managing all memories owned by the connected wallet.

**Purpose**: Dashboard view of user's memories with filtering and sorting.

**API**:
```typescript
import { useWalletMemories } from 'personal-data-wallet-sdk/hooks';

function MemoryDashboard() {
  const {
    memories,
    isLoading,
    refetch,
    filters,
    setFilters,
    sortBy,
    setSortBy
  } = useWalletMemories({
    initialFilters: {
      category: 'personal',
      dateRange: { start: new Date('2024-01-01'), end: new Date() }
    },
    sortBy: 'timestamp-desc'
  });

  return (
    <div>
      {/* Filters */}
      <select onChange={(e) => setFilters({ category: e.target.value })}>
        <option value="all">All Categories</option>
        <option value="personal">Personal</option>
        <option value="work">Work</option>
      </select>

      {/* Memory List */}
      {memories.map((memory) => (
        <MemoryCard key={memory.blobId} memory={memory} />
      ))}
    </div>
  );
}
```

**Features**:
- ✅ Fetch all on-chain memory records
- ✅ Client-side filtering (category, date, importance)
- ✅ Client-side sorting
- ✅ Lazy loading (pagination)
- ✅ Virtual scrolling for large lists
- ✅ Bulk operations (delete, export)
- ✅ Memory statistics (total, by category, storage used)

**Return Type**:
```typescript
{
  memories: Memory[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  filters: MemoryFilters;
  setFilters: (filters: Partial<MemoryFilters>) => void;
  sortBy: 'timestamp-asc' | 'timestamp-desc' | 'importance' | 'category';
  setSortBy: (sort: SortOption) => void;
  stats: {
    total: number;
    byCategory: Record<string, number>;
    totalStorageBytes: number;
  };
}
```

**Implementation Priority**: 🟡 **MEDIUM** - Important for memory management

---

## 2. Advanced Hooks (Nice-to-have)

### `useMemoryRetrieval(blobId)`

Hook for lazy-loading and decrypting memory content.

**Purpose**: Load memory content on-demand with caching.

**API**:
```typescript
import { useMemoryRetrieval } from 'personal-data-wallet-sdk/hooks';

function MemoryViewer({ blobId }: { blobId: string }) {
  const { content, isLoading, isEncrypted, decrypt } = useMemoryRetrieval(blobId, {
    autoDecrypt: false // Manual decryption for sensitive content
  });

  if (!content) {
    return <button onClick={decrypt}>🔓 Decrypt and View</button>;
  }

  return <div>{content}</div>;
}
```

**Features**:
- ✅ Lazy loading (fetch only when needed)
- ✅ Manual or automatic decryption
- ✅ Content caching (avoid redundant Walrus fetches)
- ✅ Progress indicator for large files
- ✅ Supports batch retrieval

**Implementation Priority**: 🟡 **MEDIUM**

---

### `useMemoryEncryption()`

Hook for SEAL encryption/decryption utilities.

**Purpose**: Standalone encryption utilities for advanced use cases.

**API**:
```typescript
import { useMemoryEncryption } from 'personal-data-wallet-sdk/hooks';

function FileUploader() {
  const { encrypt, decrypt, sessionKey, refreshKey } = useMemoryEncryption();

  const handleUpload = async (file: File) => {
    const data = await file.arrayBuffer();
    const encrypted = await encrypt(new Uint8Array(data));
    // Upload encrypted to Walrus
  };

  return <input type="file" onChange={handleUpload} />;
}
```

**Features**:
- ✅ Encrypt arbitrary data
- ✅ Decrypt with session keys
- ✅ Session key management (TTL, refresh)
- ✅ IBE identity generation
- ✅ Key server health checks

**Implementation Priority**: 🟢 **LOW** - Advanced use cases

---

### `useBatchMemories()`

Hook for batch operations with progress tracking.

**Purpose**: Create or retrieve multiple memories efficiently.

**API**:
```typescript
import { useBatchMemories } from 'personal-data-wallet-sdk/hooks';

function BulkImport() {
  const { createBatch, progress, isProcessing } = useBatchMemories();

  const handleImport = async (memories: string[]) => {
    await createBatch(memories, {
      onProgress: (current, total) => {
        console.log(`${current}/${total} memories created`);
      }
    });
  };

  return (
    <div>
      <button onClick={() => handleImport(['memory1', 'memory2'])}>
        Import Memories
      </button>
      {isProcessing && <progress value={progress.current} max={progress.total} />}
    </div>
  );
}
```

**Features**:
- ✅ Batch create (parallelized)
- ✅ Batch retrieve (parallelized)
- ✅ Progress tracking
- ✅ Error recovery (partial success)
- ✅ Rate limiting

**Implementation Priority**: 🟢 **LOW** - Optimization

---

### `useMemoryContext()`

Hook for context wallet management.

**Purpose**: Manage multiple identity contexts (personal, work, etc.).

**API**:
```typescript
import { useMemoryContext } from 'personal-data-wallet-sdk/hooks';

function ContextSwitcher() {
  const {
    contexts,
    activeContext,
    switchContext,
    createContext
  } = useMemoryContext();

  return (
    <select value={activeContext} onChange={(e) => switchContext(e.target.value)}>
      {contexts.map((ctx) => (
        <option key={ctx.id} value={ctx.id}>{ctx.name}</option>
      ))}
    </select>
  );
}
```

**Features**:
- ✅ List user's contexts
- ✅ Switch active context
- ✅ Create new context
- ✅ Context-specific memory filtering

**Implementation Priority**: 🟢 **LOW** - Advanced feature

---

### `useMemoryAccess(memoryId)`

Hook for permission management.

**Purpose**: Grant/revoke access to memories for third-party apps.

**API**:
```typescript
import { useMemoryAccess } from 'personal-data-wallet-sdk/hooks';

function PermissionManager({ memoryId }: { memoryId: string }) {
  const { permissions, grant, revoke, isLoading } = useMemoryAccess(memoryId);

  return (
    <div>
      <h3>Who can access this memory?</h3>
      {permissions.map((perm) => (
        <div key={perm.address}>
          {perm.address} <button onClick={() => revoke(perm.address)}>Revoke</button>
        </div>
      ))}
      <button onClick={() => grant('0xRecipientAddress')}>Grant Access</button>
    </div>
  );
}
```

**Features**:
- ✅ List permissions for memory
- ✅ Grant access (time-locked, scoped)
- ✅ Revoke access
- ✅ Check if address has access

**Implementation Priority**: 🟢 **LOW** - Privacy feature

---

## 3. Implementation Plan

### Phase 1: Core Hooks (Week 1-2)
1. ✅ Set up hooks package structure
2. ✅ `useMemoryManager()` - Foundation
3. ✅ `useCreateMemory()` - Most common operation
4. ✅ `useSearchMemories()` - Search functionality
5. ✅ `useWalletMemories()` - Dashboard support

### Phase 2: Advanced Chat (Week 3)
6. ✅ `useMemoryChat()` - Killer feature
7. ✅ Write comprehensive examples
8. ✅ Create demo app using hooks

### Phase 3: Advanced Hooks (Week 4)
9. ✅ `useMemoryRetrieval()`
10. ✅ `useBatchMemories()`
11. ✅ Other advanced hooks as needed

### Phase 4: Testing & Documentation (Week 5)
12. ✅ Unit tests for all hooks
13. ✅ Integration tests with React Testing Library
14. ✅ Storybook components
15. ✅ Update README with hook examples

---

## 4. Technical Stack

### Dependencies
```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.90.2", // Already in package.json
    "react": "^18.0.0", // Peer dependency
    "@mysten/dapp-kit": "^0.19.0" // Already in package.json
  }
}
```

### File Structure
```
packages/pdw-sdk/
├── src/
│   ├── hooks/                    # NEW: React hooks
│   │   ├── index.ts             # Main exports
│   │   ├── useMemoryManager.ts
│   │   ├── useCreateMemory.ts
│   │   ├── useSearchMemories.ts
│   │   ├── useMemoryChat.ts
│   │   ├── useWalletMemories.ts
│   │   ├── useMemoryRetrieval.ts
│   │   ├── useMemoryEncryption.ts
│   │   ├── useBatchMemories.ts
│   │   ├── useMemoryContext.ts
│   │   ├── useMemoryAccess.ts
│   │   └── utils/               # Hook utilities
│   │       ├── queryClient.ts   # React Query setup
│   │       ├── cache.ts         # Cache keys
│   │       └── types.ts         # Hook types
│   └── ...
├── example-hooks/                # NEW: Example app using hooks
│   └── app/
│       ├── page.tsx             # Dashboard with useWalletMemories
│       ├── chat/
│       │   └── page.tsx         # Chat with useMemoryChat
│       └── create/
│           └── page.tsx         # Create with useCreateMemory
└── ...
```

---

## 5. Example: Complete Chat App with Hooks

**Before (Manual State Management - 200+ lines)**:
```typescript
// Current approach from CHAT_INTEGRATION_GUIDE.md
function MemoryAwareChat() {
  const [messages, setMessages] = useState([]);
  const [memories, setMemories] = useState(new Map());
  const [isProcessing, setIsProcessing] = useState(false);
  const manager = useMemo(() => new ClientMemoryManager({...}), []);

  // Manual embedding generation
  const generateQueryEmbedding = async (query: string) => { /* ... */ };

  // Manual memory search
  const searchMemories = async (query: string) => { /* ... */ };

  // Manual memory creation
  const createMemory = async (content: string) => {
    setIsProcessing(true);
    try {
      // 50+ lines of logic
    } finally {
      setIsProcessing(false);
    }
  };

  // Manual chat message handling
  const sendMessage = async (message: string) => {
    // 80+ lines of logic
  };

  return (/* 100+ lines of JSX */);
}
```

**After (With Hooks - 50 lines)**:
```typescript
import { useMemoryChat } from 'personal-data-wallet-sdk/hooks';

function MemoryAwareChat() {
  const {
    messages,
    sendMessage,
    createMemory,
    isProcessing,
    retrievedMemories
  } = useMemoryChat({
    systemPrompt: 'You are a helpful assistant.',
    maxContextMemories: 5
  });

  return (
    <div className="chat-container">
      {messages.map((msg, i) => (
        <ChatMessage key={i} message={msg} />
      ))}

      <ChatInput
        onSend={sendMessage}
        onRemember={createMemory}
        disabled={isProcessing}
      />

      {retrievedMemories.length > 0 && (
        <MemoryContext memories={retrievedMemories} />
      )}
    </div>
  );
}
```

**Reduction**: 200+ lines → 50 lines (75% less code!)

---

## 6. Benefits Summary

### For Developers:
✅ **10x faster** integration (50 lines vs 200+ lines)
✅ **Type-safe** APIs with IntelliSense
✅ **Automatic** loading/error states
✅ **Built-in** caching and optimizations
✅ **Standard** React patterns (@tanstack/react-query)
✅ **Zero** boilerplate for common operations

### For Users:
✅ **Better UX** with loading states and optimistic updates
✅ **Faster** responses via intelligent caching
✅ **More reliable** with automatic retries

### For SDK Adoption:
✅ **Lower barrier** to entry for React developers
✅ **Follows** React ecosystem conventions
✅ **Easier** to showcase in demos and examples
✅ **Competitive** with other Web3 SDKs (most have hooks)

---

## 7. Comparison with Existing Solutions

| Feature | Manual (Current) | With Hooks | Improvement |
|---------|-----------------|------------|-------------|
| **Lines of code** | 200+ | 50 | 75% less |
| **Loading states** | Manual useState | Built-in | Automatic |
| **Error handling** | Manual try/catch | Built-in | Automatic |
| **Caching** | None | React Query | 10x faster |
| **Type safety** | Partial | Full | 100% |
| **Optimistic UI** | Manual | Built-in | Better UX |
| **Retries** | Manual | Automatic | More reliable |

---

## 8. Next Steps

### Decision Required:
1. **Approve this proposal?** Yes/No
2. **Priority order for implementation?** Core hooks first, then chat, then advanced
3. **Separate package or same package?** Recommendation: Same package under `src/hooks/`
4. **Export strategy?** `import { useCreateMemory } from 'personal-data-wallet-sdk/hooks'`

### If Approved:
1. Create `src/hooks/` directory structure
2. Implement Phase 1 (Core Hooks)
3. Update example app to use hooks
4. Write documentation and migration guide
5. Publish new version with hooks

---

## 9. Migration Path for Existing Users

Hooks are **100% additive** - existing code continues to work:

```typescript
// Existing approach (still works)
import { ClientMemoryManager } from 'personal-data-wallet-sdk';
const manager = new ClientMemoryManager({...});

// New approach (opt-in)
import { useMemoryManager } from 'personal-data-wallet-sdk/hooks';
const manager = useMemoryManager();
```

**No breaking changes!**

---

## Conclusion

Creating React hooks for the PDW SDK is a **high-impact, low-risk** improvement that will:
- **Dramatically reduce** boilerplate code (75% less)
- **Improve** developer experience
- **Accelerate** SDK adoption
- **Follow** React ecosystem best practices
- **Maintain** backward compatibility

**Recommendation**: ✅ **Implement Core Hooks (Phase 1) immediately**
