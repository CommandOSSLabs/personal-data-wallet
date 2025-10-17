/**
 * Vector Module - HNSW Vector Indexing and Management
 *
 * Exports all vector-related services and utilities for the PDW SDK.
 * Uses hnswlib-wasm for full browser compatibility.
 */

export { HnswWasmService } from './HnswWasmService';
export { HnswWasmService as HnswIndexService } from './HnswWasmService'; // Backward compatibility alias
export { VectorManager } from './VectorManager';

// Re-export types from embedding module for convenience
export type {
  HNSWIndexConfig,
  HNSWSearchResult,
  HNSWSearchOptions,
  BatchConfig,
  BatchJob,
  BatchStats,
  VectorSearchOptions,
  VectorSearchResult,
  VectorSearchMatch,
  VectorError
} from '../embedding/types';

import { HnswWasmService } from './HnswWasmService';
import { VectorManager } from './VectorManager';

export default {
  HnswIndexService: HnswWasmService, // Backward compatibility
  HnswWasmService,
  VectorManager
};