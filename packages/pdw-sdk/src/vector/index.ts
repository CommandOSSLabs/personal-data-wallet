/**
 * Vector Module - HNSW Vector Indexing and Management
 * 
 * Exports all vector-related services and utilities for the PDW SDK.
 */

export { HnswIndexService } from './HnswIndexService';
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

import { HnswIndexService } from './HnswIndexService';
import { VectorManager } from './VectorManager';

export default {
  HnswIndexService,
  VectorManager
};