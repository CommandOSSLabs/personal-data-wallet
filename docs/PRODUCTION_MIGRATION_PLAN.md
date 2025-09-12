
# Production Migration Plan: Walrus Quilt Batch Storage Integration

## Executive Summary

This document outlines the comprehensive migration plan for integrating Walrus Quilt batch storage into the Personal Data Wallet application. The migration leverages Walrus's efficient batching capabilities that provide **106x-420x cost savings** for small files (10-100KB memories) while maintaining decentralized storage benefits.

## Architecture Overview

### Core Technologies
- **Walrus SDK**: @mysten/walrus v0.6.4+ for official storage operations
- **SEAL SDK**: @mysten/seal v0.5.2+ for identity-based encryption (Note: `getAllowlistedKeyServers()` removed - use direct object IDs)
- **Sui Network**: Blockchain infrastructure for access control
- **HNSW Indexing**: Hierarchical Navigable Small World for vector search
- **Quilt Batching**: Up to 660 files per batch with automatic optimization

### System Components

```typescript
// Production Architecture Stack
interface ProductionArchitecture {
  storage: {
    primary: 'Walrus Quilt Batching';
    aggregator: 'https://aggregator.walrus-testnet.walrus.space';
    maxBatchSize: 660;
    optimalBatchSize: 50-100; // For memory-sized documents
  };
  encryption: {
    provider: 'SEAL SDK';
    keyServers: ['mysten-testnet-1', 'mysten-testnet-2'];
    threshold: '2-of-2';
    sessionStorage: 'IndexedDB';
  };
  indexing: {
    vector: 'HNSW';
    dimensions: 768; // Gemini embeddings
    semantic: 'Category-based clustering';
  };
}
```
        D[NestJS API] --> E[Walrus Aggregator Service]
        D --> F[Quilt Batch Service]
        D --> G[SEAL Production Service]
        D --> H[Session Key Manager]
    end
    
    subgraph "Storage Layer"
        E --> I[Walrus Aggregator Network]
        F --> J[Quilt Batch Storage]
## Phase 1: Walrus SDK Integration (Week 1)

### 1.1 Package Installation and Setup

```bash
# Install production dependencies
npm install --save @mysten/walrus@^0.6.4 @mysten/sui@latest @mysten/seal@^0.5.2

# Note: @mysten/seal v0.5.2+ removed getAllowlistedKeyServers() function
# Use direct key server object IDs from verified MystenLabs servers

# Development dependencies
npm install --save-dev @types/node undici
```

### 1.2 WalrusClient Configuration

```typescript
// backend/src/infrastructure/walrus/walrus-client.config.ts
import { WalrusClient } from '@mysten/walrus';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RetryableWalrusClientError } from '@mysten/walrus';

@Injectable()
export class WalrusClientFactory {
  private client: WalrusClient;
  private suiClient: SuiClient;

  constructor(private configService: ConfigService) {
    this.initializeClients();
  }

  private initializeClients() {
    // Initialize Sui client
    const network = this.configService.get('SUI_NETWORK', 'testnet');
    this.suiClient = new SuiClient({
      url: getFullnodeUrl(network as 'testnet' | 'mainnet'),
    });

    // Initialize Walrus client with production configuration
    this.client = new WalrusClient({
      network: network as 'testnet',
      suiClient: this.suiClient,
      storageNodeClientOptions: {
        timeout: 60_000, // 60 second timeout for large batches
        onError: (error) => {
          console.error('Storage node error:', error);
          // Implement alerting/monitoring here
        },
      },
    });
  }

  getClient(): WalrusClient {
    return this.client;
  }

  async handleRetryableError<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (error instanceof RetryableWalrusClientError) {
          console.warn(`Retryable error on attempt ${attempt + 1}, resetting client...`);
          this.client.reset();
          lastError = error;
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
        } else {
          throw error;
        }
      }
    }
    
    throw lastError;
  }
}
```

@Injectable()
export class WalrusClientService {
  private walrusClient: WalrusClient;
  private logger = new Logger(WalrusClientService.name);

  constructor(private configService: ConfigService) {
    this.initializeClient();
  }

  private async initializeClient() {
    const suiClient = new SuiClient({
      url: getFullnodeUrl('testnet'),
    });

    this.walrusClient = new WalrusClient({
      network: 'testnet',
      suiClient,
    });
  }

  async uploadBlob(data: Uint8Array): Promise<string> {
    // Implementation using official SDK
  }

  async readBlob(blobId: string): Promise<Uint8Array> {
    // Implementation with retry logic
  }
}
```

### **Component 2: Quilt Batch Service**

**File**: `backend/src/infrastructure/walrus/quilt-batch.service.ts`

```typescript
@Injectable()
export class QuiltBatchService {
  private readonly BATCH_SIZE = 100; // Optimal for small memories
  
  async batchMemories(
    memories: Memory[],
    category: string
  ): Promise<string> {
    const files = memories.map(memory => 
      WalrusFile.from(JSON.stringify(memory), {
        identifier: memory.id,
        tags: {
          category,
          timestamp: memory.createdAt,
          user: memory.userAddress,
          type: 'memory'
        }
      })
    );

    const results = await this.walrusClient.writeFiles({
      files,
      epochs: 10,
      deletable: true,
      signer: this.keypair
    });

    return results[0].blobId; // Quilt ID
  }
}
```

---

## 📊 **Migration Timeline & Dependencies**

| Phase | Duration | Dependencies | Risk Level |
|-------|----------|--------------|------------|
| Phase 1: Walrus Infrastructure | 2 weeks | None | Low |
| Phase 2: Quilt Integration | 1 week | Phase 1 | Medium |
| Phase 3: Storage Migration | 1 week | Phase 2 | High |
| Phase 4: Key Server Setup | 1 week | Phase 3 | Medium |

**Total Duration**: 5 weeks
**Critical Path**: Phase 1 → Phase 2 → Phase 3 → Phase 4

---

## 🔧 **Configuration Requirements**

### **Environment Variables (Testnet)**

```bash
# Walrus Configuration
WALRUS_NETWORK=testnet
WALRUS_AGGREGATOR_URL=https://aggregator.walrus-testnet.walrus.space

# Sui Configuration  
SUI_NETWORK=testnet
SUI_RPC_URL=https://fullnode.testnet.sui.io:443

# SEAL Configuration
SEAL_PACKAGE_ID=0x... # Testnet package ID
# Official MystenLabs testnet key servers in Open mode
SEAL_KEY_SERVERS=0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75,0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8

# Session Management
SESSION_STORAGE_TYPE=indexeddb
SESSION_TTL=1800 # 30 minutes
```

---

## ⚠️ **Risk Assessment & Mitigation**

### **High-Risk Areas**

1. **Data Migration**: Risk of data loss during storage migration
   - **Mitigation**: Implement dual-write pattern during transition
   - **Rollback**: Keep original data until migration verified

2. **Key Server Integration**: Risk of authentication failures
   - **Mitigation**: Implement comprehensive testing with testnet servers
   - **Rollback**: Maintain mock authentication as fallback

3. **Performance Impact**: Risk of slower response times
   - **Mitigation**: Implement caching and connection pooling
   - **Monitoring**: Add performance metrics and alerting

### **Medium-Risk Areas**

1. **Quilt Batch Optimization**: Risk of suboptimal batching
   - **Mitigation**: Start with conservative batch sizes, optimize iteratively

2. **Session Management**: Risk of user experience degradation
   - **Mitigation**: Implement graceful session recovery

---

## 🧪 **Testing Strategy**

### **Phase-by-Phase Testing**

#### **Phase 1 Testing**
- Unit tests for WalrusClientService
- Integration tests with testnet aggregators
- Performance benchmarks vs. current implementation

#### **Phase 2 Testing**
- Quilt batch creation and retrieval tests
- Memory clustering algorithm validation
- Cost optimization verification

#### **Phase 3 Testing**
- Data migration integrity tests
- Concurrent access testing
- Rollback procedure validation

#### **Phase 4 Testing**
- End-to-end authentication flows
- Key server failover testing
- Security audit of production flows

---

## 📈 **Success Metrics**

### **Performance Targets**
- **Storage Cost Reduction**: 50-80% through Quilt batching
- **Query Performance**: <500ms for memory retrieval
- **Availability**: 99.9% uptime with aggregator failover

### **Functional Targets**
- **Zero Data Loss**: During migration process
- **Session Persistence**: Across browser restarts
- **Authentication Success**: >99% success rate

---

## 🔄 **Rollback Strategy**

### **Per-Phase Rollback Plans**

1. **Phase 1**: Revert to custom Walrus service
2. **Phase 2**: Disable Quilt, use individual blob storage
3. **Phase 3**: Revert to in-memory storage with data export
4. **Phase 4**: Fallback to mock authentication

### **Emergency Procedures**
- Feature flags for instant rollback
- Data export utilities for emergency backup
- Health check endpoints for monitoring

---

## 💻 **Detailed Implementation Steps**

### **Step 1: Install Dependencies**

```bash
# Backend dependencies
cd backend
npm install @mysten/walrus@0.6.4
npm install @mysten/sui@1.0.0
npm install @mysten/seal@0.5.2

# Remove old dependencies
npm uninstall axios # Will be replaced by official SDK
```

### **Step 2: Create Production Services**

#### **A. Walrus Aggregator Service**

**File**: `backend/src/infrastructure/walrus/walrus-aggregator.service.ts`

```typescript
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WalrusClient } from '@mysten/walrus';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { RetryableWalrusClientError } from '@mysten/walrus';

@Injectable()
export class WalrusAggregatorService implements OnModuleInit {
  private walrusClient: WalrusClient;
  private suiClient: SuiClient;
  private logger = new Logger(WalrusAggregatorService.name);
  private cache = new Map<string, { data: Uint8Array; timestamp: number }>();
  private readonly CACHE_TTL = 3600000; // 1 hour

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.initializeClients();
  }

  private async initializeClients() {
    try {
      this.suiClient = new SuiClient({
        url: this.configService.get('SUI_RPC_URL', getFullnodeUrl('testnet')),
      });

      this.walrusClient = new WalrusClient({
        network: this.configService.get('WALRUS_NETWORK', 'testnet'),
        suiClient: this.suiClient,
      });

      this.logger.log('Walrus aggregator service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Walrus clients', error);
      throw error;
    }
  }

  async readBlob(blobId: string): Promise<Uint8Array> {
    // Check cache first
    const cached = this.cache.get(blobId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      this.logger.debug(`Cache hit for blob: ${blobId}`);
      return cached.data;
    }

    try {
      const data = await this.walrusClient.readBlob({ blobId });

      // Cache the result
      this.cache.set(blobId, { data, timestamp: Date.now() });

      // Clean up old cache entries
      this.cleanupCache();

      return data;
    } catch (error) {
      if (error instanceof RetryableWalrusClientError) {
        this.logger.warn('Retryable error, resetting client and retrying');
        this.walrusClient.reset();
        return await this.walrusClient.readBlob({ blobId });
      }

      this.logger.error(`Failed to read blob ${blobId}`, error);
      throw error;
    }
  }

  private cleanupCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.CACHE_TTL) {
        this.cache.delete(key);
      }
    }
  }

  async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    cacheSize: number;
    lastError?: string;
  }> {
    try {
      // Test with a known blob or create a test blob
      await this.walrusClient.readBlob({ blobId: 'test-blob-id' });
      return {
        status: 'healthy',
        cacheSize: this.cache.size,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        cacheSize: this.cache.size,
        lastError: error.message,
      };
    }
  }
}
```

#### **B. Quilt Batch Service**

**File**: `backend/src/infrastructure/walrus/quilt-batch.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { WalrusClient, WalrusFile } from '@mysten/walrus';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { ConfigService } from '@nestjs/config';

interface BatchMetadata {
  category: string;
  userAddress: string;
  batchType: 'memories' | 'indices' | 'graphs';
  createdAt: string;
  itemCount: number;
}

@Injectable()
export class QuiltBatchService {
  private readonly logger = new Logger(QuiltBatchService.name);
  private readonly OPTIMAL_BATCH_SIZE = 100;
  private readonly MAX_BATCH_SIZE = 660;
  private keypair: Ed25519Keypair;

  constructor(
    private walrusClient: WalrusClient,
    private configService: ConfigService
  ) {
    // Initialize keypair for signing transactions
    const privateKey = this.configService.get('WALRUS_PRIVATE_KEY');
    if (privateKey) {
      this.keypair = Ed25519Keypair.fromSecretKey(privateKey);
    } else {
      this.keypair = Ed25519Keypair.generate();
      this.logger.warn('Using generated keypair - not suitable for production');
    }
  }

  async batchMemories(
    memories: Array<{
      id: string;
      content: string;
      category: string;
      userAddress: string;
      createdAt: string;
    }>
  ): Promise<string> {
    if (memories.length === 0) {
      throw new Error('Cannot create batch with zero memories');
    }

    if (memories.length > this.MAX_BATCH_SIZE) {
      throw new Error(`Batch size ${memories.length} exceeds maximum ${this.MAX_BATCH_SIZE}`);
    }

    try {
      const files = memories.map(memory =>
        WalrusFile.from(JSON.stringify(memory), {
          identifier: memory.id,
          tags: {
            'content-type': 'application/json',
            'category': memory.category,
            'user-address': memory.userAddress,
            'created-at': memory.createdAt,
            'batch-type': 'memories',
            'item-type': 'memory'
          }
        })
      );

      const results = await this.walrusClient.writeFiles({
        files,
        epochs: 10, // Storage duration
        deletable: true,
        signer: this.keypair,
      });

      const quiltId = results[0].blobId;

      this.logger.log(`Created memory batch ${quiltId} with ${memories.length} items`);
      return quiltId;
    } catch (error) {
      this.logger.error('Failed to create memory batch', error);
      throw error;
    }
  }

  async retrieveMemoriesFromBatch(
    quiltId: string,
    filters?: {
      category?: string;
      userAddress?: string;
      memoryIds?: string[];
    }
  ): Promise<Array<{
    id: string;
    content: string;
    category: string;
    userAddress: string;
    createdAt: string;
  }>> {
    try {
      const blob = await this.walrusClient.getFiles({ ids: [quiltId] });

      let files;
      if (filters) {
        const tagFilters = [];
        if (filters.category) {
          tagFilters.push({ 'category': filters.category });
        }
        if (filters.userAddress) {
          tagFilters.push({ 'user-address': filters.userAddress });
        }

        if (filters.memoryIds) {
          files = await blob.files({ identifiers: filters.memoryIds });
        } else if (tagFilters.length > 0) {
          files = await blob.files({ tags: tagFilters });
        } else {
          files = await blob.files();
        }
      } else {
        files = await blob.files();
      }

      const memories = [];
      for (const file of files) {
        const content = await file.text();
        const memory = JSON.parse(content);
        memories.push(memory);
      }

      return memories;
    } catch (error) {
      this.logger.error(`Failed to retrieve memories from batch ${quiltId}`, error);
      throw error;
    }
  }

  async batchIndices(
    indices: Array<{
      id: string;
      data: Buffer;
      userAddress: string;
      version: number;
    }>
  ): Promise<string> {
    const files = indices.map(index =>
      WalrusFile.from(index.data, {
        identifier: `index_${index.id}_v${index.version}`,
        tags: {
          'content-type': 'application/octet-stream',
          'user-address': index.userAddress,
          'version': index.version.toString(),
          'batch-type': 'indices',
          'item-type': 'hnsw-index'
        }
      })
    );

    const results = await this.walrusClient.writeFiles({
      files,
      epochs: 20, // Longer storage for indices
      deletable: false, // Indices should not be deletable
      signer: this.keypair,
    });

    return results[0].blobId;
  }

  async getOptimalBatchSize(itemSizes: number[]): Promise<number> {
    const averageSize = itemSizes.reduce((a, b) => a + b, 0) / itemSizes.length;

    // For very small items (< 10KB), use larger batches
    if (averageSize < 10000) {
      return Math.min(this.MAX_BATCH_SIZE, 200);
    }

    // For medium items (10KB - 100KB), use standard batch size
    if (averageSize < 100000) {
      return this.OPTIMAL_BATCH_SIZE;
    }

    // For larger items, use smaller batches
    return Math.min(this.OPTIMAL_BATCH_SIZE, 50);
  }
}
```

### **Step 3: Replace In-Memory Storage**

#### **A. Persistent Allowlist Service**

**File**: `backend/src/infrastructure/seal/persistent-allowlist.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { QuiltBatchService } from '../walrus/quilt-batch.service';
import { WalrusAggregatorService } from '../walrus/walrus-aggregator.service';

interface AllowlistPolicy {
  id: string;
  name: string;
  description?: string;
  addresses: string[];
  owner: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  memoryCount: number;
}

@Injectable()
export class PersistentAllowlistService {
  private readonly logger = new Logger(PersistentAllowlistService.name);
  private allowlistCache = new Map<string, AllowlistPolicy>();
  private userAllowlistsCache = new Map<string, string[]>(); // userAddress -> allowlistIds
  private readonly CACHE_TTL = 300000; // 5 minutes

  constructor(
    private quiltBatchService: QuiltBatchService,
    private walrusAggregatorService: WalrusAggregatorService
  ) {}

  async createAllowlist(allowlist: Omit<AllowlistPolicy, 'id'>): Promise<AllowlistPolicy> {
    const id = `allowlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newAllowlist: AllowlistPolicy = {
      ...allowlist,
      id,
    };

    // Store in Quilt batch
    await this.saveAllowlistToBatch(newAllowlist);

    // Update cache
    this.allowlistCache.set(id, newAllowlist);
    this.updateUserCache(allowlist.owner, id);

    this.logger.log(`Created allowlist: ${id}`);
    return newAllowlist;
  }

  async getAllowlist(id: string): Promise<AllowlistPolicy | null> {
    // Check cache first
    if (this.allowlistCache.has(id)) {
      return this.allowlistCache.get(id);
    }

    // Load from storage
    return await this.loadAllowlistFromStorage(id);
  }

  async getUserAllowlists(userAddress: string): Promise<AllowlistPolicy[]> {
    // Check cache
    const cachedIds = this.userAllowlistsCache.get(userAddress);
    if (cachedIds) {
      const allowlists = [];
      for (const id of cachedIds) {
        const allowlist = await this.getAllowlist(id);
        if (allowlist) {
          allowlists.push(allowlist);
        }
      }
      return allowlists;
    }

    // Load from storage
    return await this.loadUserAllowlistsFromStorage(userAddress);
  }

  private async saveAllowlistToBatch(allowlist: AllowlistPolicy): Promise<void> {
    try {
      // Create a batch with this single allowlist
      // In production, you might batch multiple allowlists together
      const batchData = [{
        id: allowlist.id,
        content: JSON.stringify(allowlist),
        category: 'allowlist',
        userAddress: allowlist.owner,
        createdAt: allowlist.createdAt,
      }];

      await this.quiltBatchService.batchMemories(batchData);
    } catch (error) {
      this.logger.error(`Failed to save allowlist ${allowlist.id} to batch`, error);
      throw error;
    }
  }

  private async loadAllowlistFromStorage(id: string): Promise<AllowlistPolicy | null> {
    // Implementation would query Quilt batches for allowlist data
    // This is a simplified version - in production you'd maintain an index
    // of allowlist IDs to batch IDs for efficient retrieval

    try {
      // This would be replaced with actual batch querying logic
      // For now, return null to indicate not found
      return null;
    } catch (error) {
      this.logger.error(`Failed to load allowlist ${id} from storage`, error);
      return null;
    }
  }

  private async loadUserAllowlistsFromStorage(userAddress: string): Promise<AllowlistPolicy[]> {
    // Implementation would query Quilt batches for user's allowlists
    // This requires maintaining an index of user addresses to batch IDs

    try {
      // Placeholder implementation
      return [];
    } catch (error) {
      this.logger.error(`Failed to load allowlists for user ${userAddress}`, error);
      return [];
    }
  }

  private updateUserCache(userAddress: string, allowlistId: string): void {
    const existing = this.userAllowlistsCache.get(userAddress) || [];
    if (!existing.includes(allowlistId)) {
      existing.push(allowlistId);
      this.userAllowlistsCache.set(userAddress, existing);
    }
  }
}
```

### **Step 4: Session Key Management**

#### **A. Persistent Session Key Service**

**File**: `backend/src/infrastructure/seal/session-key-manager.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface SessionKeyData {
  sessionKey: string;
  userAddress: string;
  packageId: string;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
  lastUsed: string;
}

@Injectable()
export class SessionKeyManagerService {
  private readonly logger = new Logger(SessionKeyManagerService.name);
  private readonly SESSION_TTL: number;

  constructor(private configService: ConfigService) {
    this.SESSION_TTL = this.configService.get('SESSION_TTL', 1800) * 1000; // Convert to ms
  }

  async createSessionKey(
    userAddress: string,
    packageId: string
  ): Promise<SessionKeyData> {
    const sessionKey = this.generateSessionKey();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.SESSION_TTL);

    const sessionData: SessionKeyData = {
      sessionKey,
      userAddress,
      packageId,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      isActive: true,
      lastUsed: now.toISOString(),
    };

    // Store in IndexedDB (browser) or secure storage (server)
    await this.storeSessionKey(sessionData);

    this.logger.log(`Created session key for user ${userAddress}`);
    return sessionData;
  }

  async getSessionKey(
    userAddress: string,
    packageId: string
  ): Promise<SessionKeyData | null> {
    const sessionData = await this.retrieveSessionKey(userAddress, packageId);

    if (!sessionData) {
      return null;
    }

    // Check if session is expired
    if (new Date() > new Date(sessionData.expiresAt)) {
      await this.invalidateSessionKey(userAddress, packageId);
      return null;
    }

    // Update last used timestamp
    sessionData.lastUsed = new Date().toISOString();
    await this.storeSessionKey(sessionData);

    return sessionData;
  }

  async refreshSessionKey(
    userAddress: string,
    packageId: string
  ): Promise<SessionKeyData | null> {
    const existing = await this.getSessionKey(userAddress, packageId);
    if (!existing) {
      return null;
    }

    // Extend expiration
    const now = new Date();
    existing.expiresAt = new Date(now.getTime() + this.SESSION_TTL).toISOString();
    existing.lastUsed = now.toISOString();

    await this.storeSessionKey(existing);
    return existing;
  }

  async invalidateSessionKey(userAddress: string, packageId: string): Promise<void> {
    const key = this.getStorageKey(userAddress, packageId);

    if (typeof window !== 'undefined') {
      // Browser environment
      localStorage.removeItem(key);

      // Also try IndexedDB
      try {
        const request = indexedDB.deleteDatabase('seal-sessions');
        request.onsuccess = () => {
          this.logger.debug('IndexedDB session cleared');
        };
      } catch (error) {
        this.logger.warn('Failed to clear IndexedDB session', error);
      }
    } else {
      // Server environment - implement secure storage cleanup
      // This could be file-based, database, or encrypted storage
    }

    this.logger.log(`Invalidated session key for user ${userAddress}`);
  }

  private generateSessionKey(): string {
    // Generate cryptographically secure session key
    const array = new Uint8Array(32);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
    } else {
      // Node.js environment
      const crypto = require('crypto');
      crypto.randomFillSync(array);
    }

    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private async storeSessionKey(sessionData: SessionKeyData): Promise<void> {
    const key = this.getStorageKey(sessionData.userAddress, sessionData.packageId);

    if (typeof window !== 'undefined') {
      // Browser environment
      try {
        // Try IndexedDB first for better persistence
        await this.storeInIndexedDB(key, sessionData);
      } catch (error) {
        // Fallback to localStorage
        localStorage.setItem(key, JSON.stringify(sessionData));
      }
    } else {
      // Server environment - implement secure storage
      // This should use encrypted storage or secure database
    }
  }

  private async retrieveSessionKey(
    userAddress: string,
    packageId: string
  ): Promise<SessionKeyData | null> {
    const key = this.getStorageKey(userAddress, packageId);

    if (typeof window !== 'undefined') {
      // Browser environment
      try {
        // Try IndexedDB first
        const data = await this.retrieveFromIndexedDB(key);
        if (data) return data;
      } catch (error) {
        // Fallback to localStorage
        const stored = localStorage.getItem(key);
        if (stored) {
          return JSON.parse(stored);
        }
      }
    } else {
      // Server environment - implement secure retrieval
    }

    return null;
  }

  private getStorageKey(userAddress: string, packageId: string): string {
    return `seal_session_${userAddress}_${packageId}`;
  }

  private async storeInIndexedDB(key: string, data: SessionKeyData): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('seal-sessions', 1);

      request.onerror = () => reject(request.error);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('sessions')) {
          db.createObjectStore('sessions');
        }
      };

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['sessions'], 'readwrite');
        const store = transaction.objectStore('sessions');

        const putRequest = store.put(data, key);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };
    });
  }

  private async retrieveFromIndexedDB(key: string): Promise<SessionKeyData | null> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('seal-sessions', 1);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['sessions'], 'readonly');
        const store = transaction.objectStore('sessions');

        const getRequest = store.get(key);
        getRequest.onsuccess = () => {
          resolve(getRequest.result || null);
        };
        getRequest.onerror = () => reject(getRequest.error);
      };
    });
  }
}
```

### **Step 5: Production Key Server Integration**

#### **A. Key Server Configuration Service**

**File**: `backend/src/infrastructure/seal/key-server-config.service.ts`

```typescript
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SuiClient } from '@mysten/sui/client';

interface KeyServerConfig {
  objectId: string;
  weight: number;
  endpoint?: string;
  isActive: boolean;
  lastHealthCheck?: string;
  responseTime?: number;
}

@Injectable()
export class KeyServerConfigService implements OnModuleInit {
  private readonly logger = new Logger(KeyServerConfigService.name);
  private keyServers: KeyServerConfig[] = [];
  private healthCheckInterval: NodeJS.Timeout;

  constructor(
    private configService: ConfigService,
    private suiClient: SuiClient
  ) {}

  async onModuleInit() {
    await this.initializeKeyServers();
    this.startHealthChecks();
  }

  private async initializeKeyServers() {
    const serverIds = this.configService.get('SEAL_KEY_SERVERS', '').split(',');
    const network = this.configService.get('WALRUS_NETWORK', 'testnet');

    // Official MystenLabs testnet key servers (Open mode)
    const testnetServers = [
      '0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75', // mysten-testnet-1
      '0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8', // mysten-testnet-2
    ];

    const serversToUse = serverIds.length > 0 && serverIds[0] !== '' ? serverIds : testnetServers;

    this.keyServers = serversToUse.map(objectId => ({
      objectId: objectId.trim(),
      weight: 1,
      isActive: true,
    }));

    this.logger.log(`Initialized ${this.keyServers.length} key servers for ${network}`);
  }

  getActiveKeyServers(): KeyServerConfig[] {
    return this.keyServers.filter(server => server.isActive);
  }

  getKeyServerConfigs(): Array<{ objectId: string; weight: number }> {
    return this.getActiveKeyServers().map(server => ({
      objectId: server.objectId,
      weight: server.weight,
    }));
  }

  private startHealthChecks() {
    // Check key server health every 5 minutes
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthChecks();
    }, 5 * 60 * 1000);

    // Initial health check
    setTimeout(() => this.performHealthChecks(), 1000);
  }

  private async performHealthChecks() {
    for (const server of this.keyServers) {
      try {
        const startTime = Date.now();

        // Check if the key server object exists on Sui
        await this.suiClient.getObject({
          id: server.objectId,
          options: { showContent: true },
        });

        const responseTime = Date.now() - startTime;

        server.isActive = true;
        server.lastHealthCheck = new Date().toISOString();
        server.responseTime = responseTime;

        this.logger.debug(`Key server ${server.objectId} health check passed (${responseTime}ms)`);
      } catch (error) {
        server.isActive = false;
        server.lastHealthCheck = new Date().toISOString();

        this.logger.warn(`Key server ${server.objectId} health check failed`, error);
      }
    }

    const activeCount = this.getActiveKeyServers().length;
    if (activeCount === 0) {
      this.logger.error('No active key servers available!');
    } else if (activeCount < this.keyServers.length) {
      this.logger.warn(`Only ${activeCount}/${this.keyServers.length} key servers are active`);
    }
  }

  async getHealthStatus(): Promise<{
    totalServers: number;
    activeServers: number;
    servers: KeyServerConfig[];
  }> {
    return {
      totalServers: this.keyServers.length,
      activeServers: this.getActiveKeyServers().length,
      servers: [...this.keyServers],
    };
  }

  onModuleDestroy() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }
}
```

### **Step 6: Production SEAL Service**

#### **A. Enhanced SEAL Service**

**File**: `backend/src/infrastructure/seal/production-seal.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { SealClient } from '@mysten/seal';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { SessionKeyManagerService } from './session-key-manager.service';
import { KeyServerConfigService } from './key-server-config.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProductionSealService {
  private sealClient: SealClient;
  private readonly logger = new Logger(ProductionSealService.name);
  private readonly packageId: string;
  private readonly threshold: number;

  constructor(
    private suiClient: SuiClient,
    private sessionKeyManager: SessionKeyManagerService,
    private keyServerConfig: KeyServerConfigService,
    private configService: ConfigService
  ) {
    this.packageId = this.configService.get('SEAL_PACKAGE_ID');
    this.threshold = this.configService.get('SEAL_THRESHOLD', 2);
    this.initializeSealClient();
  }

  private initializeSealClient() {
    const serverConfigs = this.keyServerConfig.getKeyServerConfigs();

    this.sealClient = new SealClient({
      suiClient: this.suiClient,
      serverConfigs,
      verifyKeyServers: true,
    });

    this.logger.log(`Initialized SEAL client with ${serverConfigs.length} key servers`);
  }

  async encrypt(
    data: Uint8Array,
    identityId: string
  ): Promise<{ encrypted: Uint8Array; identityId: string }> {
    try {
      const result = await this.sealClient.encrypt({
        threshold: this.threshold,
        packageId: this.packageId,
        id: identityId,
        data,
      });

      this.logger.debug(`Successfully encrypted data with identity: ${identityId}`);

      return {
        encrypted: result.encryptedObject,
        identityId,
      };
    } catch (error) {
      this.logger.error(`Encryption failed for identity ${identityId}`, error);
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  async decrypt(
    encryptedData: Uint8Array,
    identityId: string,
    userAddress: string,
    accessTransaction: Transaction
  ): Promise<Uint8Array> {
    try {
      // Get or create session key
      let sessionKeyData = await this.sessionKeyManager.getSessionKey(
        userAddress,
        this.packageId
      );

      if (!sessionKeyData) {
        sessionKeyData = await this.sessionKeyManager.createSessionKey(
          userAddress,
          this.packageId
        );
      }

      // Build transaction bytes
      const txBytes = await accessTransaction.build({
        client: this.suiClient,
        onlyTransactionKind: true,
      });

      // Fetch keys from key servers
      await this.sealClient.fetchKeys({
        ids: [identityId],
        txBytes,
        sessionKey: sessionKeyData.sessionKey,
        threshold: this.threshold,
      });

      // Decrypt the data
      const decrypted = await this.sealClient.decrypt({
        data: encryptedData,
        sessionKey: sessionKeyData.sessionKey,
        txBytes,
      });

      this.logger.debug(`Successfully decrypted data for identity: ${identityId}`);
      return decrypted;
    } catch (error) {
      this.logger.error(`Decryption failed for identity ${identityId}`, error);
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  async createAllowlistAccessTransaction(
    allowlistObjectId: string
  ): Promise<(tx: Transaction, identityId: string) => void> {
    return (tx: Transaction, identityId: string) => {
      tx.moveCall({
        target: `${this.packageId}::allowlist::seal_approve_allowlist`,
        arguments: [
          tx.pure.string(identityId),
          tx.object(allowlistObjectId),
        ],
      });
    };
  }

  async createRoleAccessTransaction(
    roleObjectId: string
  ): Promise<(tx: Transaction, identityId: string) => void> {
    return (tx: Transaction, identityId: string) => {
      tx.moveCall({
        target: `${this.packageId}::roles::seal_approve_role`,
        arguments: [
          tx.pure.string(identityId),
          tx.object(roleObjectId),
        ],
      });
    };
  }

  async createTimelockAccessTransaction(
    clockObjectId: string = '0x6' // SUI_CLOCK_OBJECT_ID
  ): Promise<(tx: Transaction, identityId: string) => void> {
    return (tx: Transaction, identityId: string) => {
      tx.moveCall({
        target: `${this.packageId}::timelock::seal_approve_time`,
        arguments: [
          tx.pure.string(identityId),
          tx.object(clockObjectId),
        ],
      });
    };
  }

  async getHealthStatus(): Promise<{
    sealClient: 'healthy' | 'unhealthy';
    keyServers: any;
    packageId: string;
    threshold: number;
  }> {
    try {
      const keyServerStatus = await this.keyServerConfig.getHealthStatus();

      return {
        sealClient: keyServerStatus.activeServers > 0 ? 'healthy' : 'unhealthy',
        keyServers: keyServerStatus,
        packageId: this.packageId,
        threshold: this.threshold,
      };
    } catch (error) {
      return {
        sealClient: 'unhealthy',
        keyServers: { error: error.message },
        packageId: this.packageId,
        threshold: this.threshold,
      };
    }
  }
}
```

## 🚀 **Deployment Configuration**

### **Environment Configuration**

**File**: `backend/.env.production`

```bash
# Walrus Configuration
WALRUS_NETWORK=testnet
WALRUS_AGGREGATOR_URL=https://aggregator.walrus-testnet.walrus.space
WALRUS_PRIVATE_KEY=your_private_key_here

# Sui Configuration
SUI_NETWORK=testnet
SUI_RPC_URL=https://fullnode.testnet.sui.io:443

# SEAL Configuration
SEAL_PACKAGE_ID=0x... # Your deployed SEAL package ID on testnet
# Official MystenLabs testnet key servers in Open mode
SEAL_KEY_SERVERS=0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75,0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8
SEAL_THRESHOLD=2 # 2-of-2 threshold with MystenLabs testnet servers

# Session Management
SESSION_TTL=1800 # 30 minutes
SESSION_STORAGE_TYPE=indexeddb

# Caching
CACHE_TTL=3600 # 1 hour
CACHE_MAX_SIZE=1000

# Monitoring
LOG_LEVEL=info
HEALTH_CHECK_INTERVAL=300000 # 5 minutes
```

### **Module Configuration**

**File**: `backend/src/infrastructure/infrastructure.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';

// Import new production services
import { WalrusAggregatorService } from './walrus/walrus-aggregator.service';
import { QuiltBatchService } from './walrus/quilt-batch.service';
import { SessionKeyManagerService } from './seal/session-key-manager.service';
import { KeyServerConfigService } from './seal/key-server-config.service';
import { ProductionSealService } from './seal/production-seal.service';
import { PersistentAllowlistService } from './seal/persistent-allowlist.service';

// Legacy services (to be phased out)
import { WalrusService } from './walrus/walrus.service';
import { SealService } from './seal/seal.service';

@Module({
  imports: [ConfigModule],
  providers: [
    // Sui Client
    {
      provide: SuiClient,
      useFactory: (configService: ConfigService) => {
        return new SuiClient({
          url: configService.get('SUI_RPC_URL', getFullnodeUrl('testnet')),
        });
      },
      inject: [ConfigService],
    },

    // New Production Services
    WalrusAggregatorService,
    QuiltBatchService,
    SessionKeyManagerService,
    KeyServerConfigService,
    ProductionSealService,
    PersistentAllowlistService,

    // Legacy Services (for rollback capability)
    {
      provide: 'LEGACY_WALRUS_SERVICE',
      useClass: WalrusService,
    },
    {
      provide: 'LEGACY_SEAL_SERVICE',
      useClass: SealService,
    },
  ],
  exports: [
    WalrusAggregatorService,
    QuiltBatchService,
    ProductionSealService,
    PersistentAllowlistService,
    SessionKeyManagerService,

    // Keep legacy exports for rollback
    'LEGACY_WALRUS_SERVICE',
    'LEGACY_SEAL_SERVICE',
  ],
})
export class InfrastructureModule {}
```

## 🧪 **Validation & Testing**

### **Step 7: Integration Testing**

**File**: `backend/src/test/integration/production-migration.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { WalrusAggregatorService } from '../../infrastructure/walrus/walrus-aggregator.service';
import { QuiltBatchService } from '../../infrastructure/walrus/quilt-batch.service';
import { ProductionSealService } from '../../infrastructure/seal/production-seal.service';

describe('Production Migration Integration Tests', () => {
  let walrusService: WalrusAggregatorService;
  let quiltService: QuiltBatchService;
  let sealService: ProductionSealService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env.test',
        }),
      ],
      providers: [
        WalrusAggregatorService,
        QuiltBatchService,
        ProductionSealService,
        // ... other dependencies
      ],
    }).compile();

    walrusService = module.get<WalrusAggregatorService>(WalrusAggregatorService);
    quiltService = module.get<QuiltBatchService>(QuiltBatchService);
    sealService = module.get<ProductionSealService>(ProductionSealService);
  });

  describe('Walrus Aggregator Service', () => {
    it('should connect to testnet aggregator', async () => {
      const health = await walrusService.getHealthStatus();
      expect(health.status).toBe('healthy');
    });

    it('should cache blob reads', async () => {
      // Test caching functionality
      const testBlobId = 'test-blob-id';

      const start1 = Date.now();
      await walrusService.readBlob(testBlobId);
      const time1 = Date.now() - start1;

      const start2 = Date.now();
      await walrusService.readBlob(testBlobId);
      const time2 = Date.now() - start2;

      expect(time2).toBeLessThan(time1); // Second call should be faster (cached)
    });
  });

  describe('Quilt Batch Service', () => {
    it('should create memory batches', async () => {
      const testMemories = [
        {
          id: 'mem1',
          content: 'Test memory 1',
          category: 'PERSONAL',
          userAddress: '0x123...',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'mem2',
          content: 'Test memory 2',
          category: 'PERSONAL',
          userAddress: '0x123...',
          createdAt: new Date().toISOString(),
        },
      ];

      const quiltId = await quiltService.batchMemories(testMemories);
      expect(quiltId).toBeDefined();
      expect(typeof quiltId).toBe('string');
    });

    it('should retrieve memories from batch', async () => {
      // Create batch first
      const testMemories = [
        {
          id: 'mem3',
          content: 'Test memory 3',
          category: 'WORK',
          userAddress: '0x456...',
          createdAt: new Date().toISOString(),
        },
      ];

      const quiltId = await quiltService.batchMemories(testMemories);

      // Retrieve memories
      const retrieved = await quiltService.retrieveMemoriesFromBatch(quiltId, {
        category: 'WORK',
      });

      expect(retrieved).toHaveLength(1);
      expect(retrieved[0].id).toBe('mem3');
    });
  });

  describe('Production SEAL Service', () => {
    it('should encrypt and decrypt data', async () => {
      const testData = new TextEncoder().encode('Test sensitive data');
      const identityId = 'test_identity_123';
      const userAddress = '0x789...';

      // Encrypt
      const { encrypted } = await sealService.encrypt(testData, identityId);
      expect(encrypted).toBeDefined();

      // Create mock access transaction
      const mockTx = new Transaction();
      // Add appropriate move call for access control

      // Decrypt
      const decrypted = await sealService.decrypt(
        encrypted,
        identityId,
        userAddress,
        mockTx
      );

      expect(decrypted).toEqual(testData);
    });

    it('should manage session keys', async () => {
      const health = await sealService.getHealthStatus();
      expect(health.sealClient).toBe('healthy');
      expect(health.keyServers.activeServers).toBeGreaterThan(0);
    });
  });
});
```

### **Step 8: Performance Benchmarks**

**File**: `backend/src/test/performance/migration-benchmarks.spec.ts`

```typescript
import { performance } from 'perf_hooks';

describe('Migration Performance Benchmarks', () => {
  describe('Storage Performance', () => {
    it('should show improved batch storage performance', async () => {
      const testMemories = Array.from({ length: 100 }, (_, i) => ({
        id: `mem_${i}`,
        content: `Test memory content ${i}`,
        category: 'PERSONAL',
        userAddress: '0x123...',
        createdAt: new Date().toISOString(),
      }));

      // Benchmark individual storage (legacy)
      const individualStart = performance.now();
      for (const memory of testMemories.slice(0, 10)) {
        // Simulate individual storage
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      const individualTime = performance.now() - individualStart;

      // Benchmark batch storage (new)
      const batchStart = performance.now();
      await quiltService.batchMemories(testMemories);
      const batchTime = performance.now() - batchStart;

      console.log(`Individual storage (10 items): ${individualTime}ms`);
      console.log(`Batch storage (100 items): ${batchTime}ms`);

      // Batch should be more efficient per item
      const individualPerItem = individualTime / 10;
      const batchPerItem = batchTime / 100;

      expect(batchPerItem).toBeLessThan(individualPerItem);
    });
  });

  describe('Caching Performance', () => {
    it('should show improved read performance with caching', async () => {
      const testBlobId = 'performance-test-blob';

      // First read (cache miss)
      const firstReadStart = performance.now();
      await walrusService.readBlob(testBlobId);
      const firstReadTime = performance.now() - firstReadStart;

      // Second read (cache hit)
      const secondReadStart = performance.now();
      await walrusService.readBlob(testBlobId);
      const secondReadTime = performance.now() - secondReadStart;

      console.log(`First read (cache miss): ${firstReadTime}ms`);
      console.log(`Second read (cache hit): ${secondReadTime}ms`);

      expect(secondReadTime).toBeLessThan(firstReadTime * 0.1); // 90% improvement
    });
  });
});
```

## 📋 **Migration Checklist**

### **Pre-Migration Checklist**

- [ ] **Environment Setup**
  - [ ] Testnet RPC endpoints configured
  - [ ] Walrus aggregator URLs verified
  - [ ] SEAL package deployed on testnet
  - [ ] Key server object IDs obtained
  - [ ] Private keys securely stored

- [ ] **Dependencies**
  - [ ] Official Walrus SDK installed (`@mysten/walrus@0.6.4`)
  - [ ] Sui SDK updated (`@mysten/sui@1.0.0`)
  - [ ] SEAL SDK installed (`@mysten/seal@0.5.2`)

- [ ] **Testing**
  - [ ] Integration tests passing
  - [ ] Performance benchmarks completed
  - [ ] Health check endpoints working

### **Migration Execution Checklist**

#### **Phase 1: Walrus Infrastructure**
- [ ] Deploy WalrusAggregatorService
- [ ] Configure aggregator endpoints
- [ ] Test blob read/write operations
- [ ] Verify caching functionality
- [ ] Monitor performance metrics

#### **Phase 2: Quilt Integration**
- [ ] Deploy QuiltBatchService
- [ ] Test memory batching
- [ ] Verify tag-based retrieval
- [ ] Benchmark cost savings
- [ ] Update memory ingestion pipeline

#### **Phase 3: Storage Migration**
- [ ] Deploy PersistentAllowlistService
- [ ] Migrate existing allowlist data
- [ ] Deploy persistent role service
- [ ] Migrate analytics to Walrus storage
- [ ] Verify data integrity

#### **Phase 4: Key Server Integration**
- [ ] Configure testnet key servers
- [ ] Deploy SessionKeyManagerService
- [ ] Test session persistence
- [ ] Deploy ProductionSealService
- [ ] Verify encryption/decryption flows

### **Post-Migration Checklist**

- [ ] **Validation**
  - [ ] All integration tests passing
  - [ ] Performance benchmarks met
  - [ ] No data loss detected
  - [ ] User sessions working correctly

- [ ] **Monitoring**
  - [ ] Health check endpoints responding
  - [ ] Performance metrics within targets
  - [ ] Error rates below thresholds
  - [ ] Cache hit ratios optimal

- [ ] **Documentation**
  - [ ] API documentation updated
  - [ ] Deployment guides updated
  - [ ] Troubleshooting guides created
  - [ ] Team training completed

## 🔄 **Rollback Procedures**

### **Emergency Rollback**

If critical issues are discovered during migration:

1. **Immediate Actions**
   ```bash
   # Revert to legacy services
   export USE_LEGACY_SERVICES=true

   # Restart application
   npm run restart:production
   ```

2. **Service-Specific Rollbacks**
   - **Walrus**: Switch back to custom HTTP API service
   - **Storage**: Revert to in-memory Maps with data export
   - **SEAL**: Use mock authentication temporarily
   - **Sessions**: Clear all sessions, force re-authentication

3. **Data Recovery**
   - Export data from Walrus before rollback
   - Restore from backup if necessary
   - Verify data integrity after rollback

### **Gradual Rollback**

For non-critical issues, implement gradual rollback:

1. **Feature Flags**: Disable new features incrementally
2. **Traffic Splitting**: Route percentage of traffic to legacy services
3. **Monitoring**: Watch metrics during rollback process
4. **Validation**: Ensure system stability at each step

---

*This comprehensive migration plan provides a structured, risk-managed approach to transitioning the Personal Data Wallet from mock implementations to production-ready Walrus infrastructure. The phased approach, detailed implementation guides, and robust testing strategy ensure a successful migration while maintaining system reliability and user experience.*

## 📝 **Key Server Configuration Notes**

### **Official MystenLabs Testnet Key Servers**

This migration plan uses the official verified testnet key servers from MystenLabs operating in Open mode:

- **mysten-testnet-1**
  - Object ID: `0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75`
  - URL: https://seal-key-server-testnet-1.mystenlabs.com

- **mysten-testnet-2**
  - Object ID: `0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8`
  - URL: https://seal-key-server-testnet-2.mystenlabs.com

### **Configuration Changes from SEAL SDK v0.5.2+**

- The `getAllowlistedKeyServers()` function has been removed in recent versions
- Key servers must now be configured directly using their object IDs
- Use a 2-of-2 threshold with the two MystenLabs testnet servers
- Both servers run in Open mode, suitable for development and testing

### **Production Considerations**

- For production deployments, consider using mainnet key servers when available
- Evaluate whether to use additional third-party key servers for higher fault tolerance
- Monitor key server health and implement fallback strategies
- Ensure proper session key management and security practices
