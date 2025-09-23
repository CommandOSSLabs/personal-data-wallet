"use strict";
/**
 * Vector Module - HNSW Vector Indexing and Management
 *
 * Exports all vector-related services and utilities for the PDW SDK.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorManager = exports.HnswIndexService = void 0;
var HnswIndexService_1 = require("./HnswIndexService");
Object.defineProperty(exports, "HnswIndexService", { enumerable: true, get: function () { return HnswIndexService_1.HnswIndexService; } });
var VectorManager_1 = require("./VectorManager");
Object.defineProperty(exports, "VectorManager", { enumerable: true, get: function () { return VectorManager_1.VectorManager; } });
const HnswIndexService_2 = require("./HnswIndexService");
const VectorManager_2 = require("./VectorManager");
exports.default = {
    HnswIndexService: HnswIndexService_2.HnswIndexService,
    VectorManager: VectorManager_2.VectorManager
};
//# sourceMappingURL=index.js.map