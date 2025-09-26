"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Memory = exports.MemoryIndex = exports.MemoryMetadata = exports.MemoryMetadataUpdated = exports.MemoryIndexUpdated = exports.MemoryCreated = void 0;
exports.createMemoryIndex = createMemoryIndex;
exports.updateMemoryIndex = updateMemoryIndex;
exports.createMemoryMetadata = createMemoryMetadata;
exports.createMemoryRecord = createMemoryRecord;
exports.updateMemoryMetadata = updateMemoryMetadata;
exports.addCustomMetadata = addCustomMetadata;
exports.deleteMemoryRecord = deleteMemoryRecord;
exports.getIndexBlobId = getIndexBlobId;
exports.getGraphBlobId = getGraphBlobId;
exports.getVersion = getVersion;
exports.getMemoryBlobId = getMemoryBlobId;
exports.getMemoryVectorId = getMemoryVectorId;
exports.getMemoryCategory = getMemoryCategory;
exports.getMetadata = getMetadata;
exports.getEmbeddingBlobId = getEmbeddingBlobId;
exports.getContentType = getContentType;
exports.getContentSize = getContentSize;
exports.getTopic = getTopic;
exports.getImportance = getImportance;
exports.getCreatedTimestamp = getCreatedTimestamp;
exports.getUpdatedTimestamp = getUpdatedTimestamp;
exports.getCustomMetadata = getCustomMetadata;
/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
const index_1 = require("../utils/index");
const bcs_1 = require("@mysten/sui/bcs");
const vec_map = __importStar(require("./deps/sui/vec_map"));
const object = __importStar(require("./deps/sui/object"));
const $moduleName = '@local-pkg/pdw::memory';
exports.MemoryCreated = new index_1.MoveStruct({ name: `${$moduleName}::MemoryCreated`, fields: {
        id: bcs_1.bcs.Address,
        owner: bcs_1.bcs.Address,
        category: bcs_1.bcs.string(),
        vector_id: bcs_1.bcs.u64()
    } });
exports.MemoryIndexUpdated = new index_1.MoveStruct({ name: `${$moduleName}::MemoryIndexUpdated`, fields: {
        id: bcs_1.bcs.Address,
        owner: bcs_1.bcs.Address,
        version: bcs_1.bcs.u64(),
        index_blob_id: bcs_1.bcs.string(),
        graph_blob_id: bcs_1.bcs.string()
    } });
exports.MemoryMetadataUpdated = new index_1.MoveStruct({ name: `${$moduleName}::MemoryMetadataUpdated`, fields: {
        memory_id: bcs_1.bcs.Address,
        metadata_blob_id: bcs_1.bcs.string(),
        embedding_dimension: bcs_1.bcs.u64()
    } });
exports.MemoryMetadata = new index_1.MoveStruct({ name: `${$moduleName}::MemoryMetadata`, fields: {
        content_type: bcs_1.bcs.string(),
        content_size: bcs_1.bcs.u64(),
        content_hash: bcs_1.bcs.string(),
        category: bcs_1.bcs.string(),
        topic: bcs_1.bcs.string(),
        importance: bcs_1.bcs.u8(),
        embedding_blob_id: bcs_1.bcs.string(),
        embedding_dimension: bcs_1.bcs.u64(),
        created_timestamp: bcs_1.bcs.u64(),
        updated_timestamp: bcs_1.bcs.u64(),
        custom_metadata: vec_map.VecMap(bcs_1.bcs.string(), bcs_1.bcs.string())
    } });
exports.MemoryIndex = new index_1.MoveStruct({ name: `${$moduleName}::MemoryIndex`, fields: {
        id: object.UID,
        owner: bcs_1.bcs.Address,
        version: bcs_1.bcs.u64(),
        index_blob_id: bcs_1.bcs.string(),
        graph_blob_id: bcs_1.bcs.string()
    } });
exports.Memory = new index_1.MoveStruct({ name: `${$moduleName}::Memory`, fields: {
        id: object.UID,
        owner: bcs_1.bcs.Address,
        category: bcs_1.bcs.string(),
        vector_id: bcs_1.bcs.u64(),
        blob_id: bcs_1.bcs.string(),
        metadata: exports.MemoryMetadata
    } });
/** Create a new memory index for a user */
function createMemoryIndex(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        'vector<u8>',
        'vector<u8>'
    ];
    const parameterNames = ["indexBlobId", "graphBlobId"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'create_memory_index',
        arguments: (0, index_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Update an existing memory index with new blob IDs */
function updateMemoryIndex(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::MemoryIndex`,
        'u64',
        'vector<u8>',
        'vector<u8>'
    ];
    const parameterNames = ["memoryIndex", "expectedVersion", "newIndexBlobId", "newGraphBlobId"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'update_memory_index',
        arguments: (0, index_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Create metadata struct with embedding */
function createMemoryMetadata(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        'vector<u8>',
        'u64',
        'vector<u8>',
        'vector<u8>',
        'vector<u8>',
        'u8',
        'vector<u8>',
        'u64',
        'u64'
    ];
    const parameterNames = ["contentType", "contentSize", "contentHash", "category", "topic", "importance", "embeddingBlobId", "embeddingDimension", "createdTimestamp"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'create_memory_metadata',
        arguments: (0, index_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Create a new memory record with rich metadata */
function createMemoryRecord(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        'vector<u8>',
        'u64',
        'vector<u8>',
        'vector<u8>',
        'u64',
        'vector<u8>',
        'vector<u8>',
        'u8',
        'vector<u8>'
    ];
    const parameterNames = ["category", "vectorId", "blobId", "contentType", "contentSize", "contentHash", "topic", "importance", "embeddingBlobId"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'create_memory_record',
        arguments: (0, index_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Update metadata for an existing memory */
function updateMemoryMetadata(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::Memory`,
        'vector<u8>',
        'u8'
    ];
    const parameterNames = ["memory", "newTopic", "newImportance"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'update_memory_metadata',
        arguments: (0, index_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Add custom metadata field */
function addCustomMetadata(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::Memory`,
        'vector<u8>',
        'vector<u8>'
    ];
    const parameterNames = ["memory", "key", "value"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'add_custom_metadata',
        arguments: (0, index_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Delete a memory record */
function deleteMemoryRecord(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::Memory`
    ];
    const parameterNames = ["memory"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'delete_memory_record',
        arguments: (0, index_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
function getIndexBlobId(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::MemoryIndex`
    ];
    const parameterNames = ["memoryIndex"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'get_index_blob_id',
        arguments: (0, index_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
function getGraphBlobId(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::MemoryIndex`
    ];
    const parameterNames = ["memoryIndex"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'get_graph_blob_id',
        arguments: (0, index_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
function getVersion(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::MemoryIndex`
    ];
    const parameterNames = ["memoryIndex"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'get_version',
        arguments: (0, index_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
function getMemoryBlobId(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::Memory`
    ];
    const parameterNames = ["memory"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'get_memory_blob_id',
        arguments: (0, index_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
function getMemoryVectorId(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::Memory`
    ];
    const parameterNames = ["memory"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'get_memory_vector_id',
        arguments: (0, index_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
function getMemoryCategory(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::Memory`
    ];
    const parameterNames = ["memory"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'get_memory_category',
        arguments: (0, index_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
function getMetadata(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::Memory`
    ];
    const parameterNames = ["memory"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'get_metadata',
        arguments: (0, index_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
function getEmbeddingBlobId(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::MemoryMetadata`
    ];
    const parameterNames = ["metadata"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'get_embedding_blob_id',
        arguments: (0, index_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
function getContentType(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::MemoryMetadata`
    ];
    const parameterNames = ["metadata"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'get_content_type',
        arguments: (0, index_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
function getContentSize(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::MemoryMetadata`
    ];
    const parameterNames = ["metadata"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'get_content_size',
        arguments: (0, index_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
function getTopic(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::MemoryMetadata`
    ];
    const parameterNames = ["metadata"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'get_topic',
        arguments: (0, index_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
function getImportance(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::MemoryMetadata`
    ];
    const parameterNames = ["metadata"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'get_importance',
        arguments: (0, index_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
function getCreatedTimestamp(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::MemoryMetadata`
    ];
    const parameterNames = ["metadata"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'get_created_timestamp',
        arguments: (0, index_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
function getUpdatedTimestamp(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::MemoryMetadata`
    ];
    const parameterNames = ["metadata"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'get_updated_timestamp',
        arguments: (0, index_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
function getCustomMetadata(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::MemoryMetadata`
    ];
    const parameterNames = ["metadata"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'get_custom_metadata',
        arguments: (0, index_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
//# sourceMappingURL=memory.js.map