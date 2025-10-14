/**
 * Vector Module - HNSW Vector Indexing and Management
 *
 * Exports all vector-related services and utilities for the PDW SDK.
 * Uses hnswlib-wasm for full browser compatibility.
 */
export { HnswWasmService } from './HnswWasmService';
export { HnswWasmService as HnswIndexService } from './HnswWasmService';
export { VectorManager } from './VectorManager';
export type { HNSWIndexConfig, HNSWSearchResult, HNSWSearchOptions, BatchConfig, BatchJob, BatchStats, VectorSearchOptions, VectorSearchResult, VectorSearchMatch, VectorError } from '../embedding/types';
import { HnswWasmService } from './HnswWasmService';
import { VectorManager } from './VectorManager';
declare const _default: {
    HnswIndexService: typeof HnswWasmService;
    HnswWasmService: typeof HnswWasmService;
    VectorManager: typeof VectorManager;
};
export default _default;
//# sourceMappingURL=index.d.ts.map