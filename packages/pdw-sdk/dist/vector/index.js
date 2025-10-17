/**
 * Vector Module - HNSW Vector Indexing and Management
 *
 * Exports all vector-related services and utilities for the PDW SDK.
 * Uses hnswlib-wasm for full browser compatibility.
 */
export { HnswWasmService } from './HnswWasmService';
export { HnswWasmService as HnswIndexService } from './HnswWasmService'; // Backward compatibility alias
export { VectorManager } from './VectorManager';
import { HnswWasmService } from './HnswWasmService';
import { VectorManager } from './VectorManager';
export default {
    HnswIndexService: HnswWasmService, // Backward compatibility
    HnswWasmService,
    VectorManager
};
//# sourceMappingURL=index.js.map