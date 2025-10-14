"use strict";
/**
 * Vector Module - HNSW Vector Indexing and Management
 *
 * Exports all vector-related services and utilities for the PDW SDK.
 * Uses hnswlib-wasm for full browser compatibility.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorManager = exports.HnswIndexService = exports.HnswWasmService = void 0;
var HnswWasmService_1 = require("./HnswWasmService");
Object.defineProperty(exports, "HnswWasmService", { enumerable: true, get: function () { return HnswWasmService_1.HnswWasmService; } });
var HnswWasmService_2 = require("./HnswWasmService"); // Backward compatibility alias
Object.defineProperty(exports, "HnswIndexService", { enumerable: true, get: function () { return HnswWasmService_2.HnswWasmService; } });
var VectorManager_1 = require("./VectorManager");
Object.defineProperty(exports, "VectorManager", { enumerable: true, get: function () { return VectorManager_1.VectorManager; } });
const HnswWasmService_3 = require("./HnswWasmService");
const VectorManager_2 = require("./VectorManager");
exports.default = {
    HnswIndexService: HnswWasmService_3.HnswWasmService, // Backward compatibility
    HnswWasmService: // Backward compatibility
    HnswWasmService_3.HnswWasmService,
    VectorManager: VectorManager_2.VectorManager
};
//# sourceMappingURL=index.js.map