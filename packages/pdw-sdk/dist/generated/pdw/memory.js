/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { MoveStruct, normalizeMoveArguments } from '../utils/index.js';
import { bcs } from '@mysten/sui/bcs';
import * as vec_map from './deps/sui/vec_map.js';
import * as object from './deps/sui/object.js';
const $moduleName = '@local-pkg/pdw::memory';
export const MemoryCreated = new MoveStruct({ name: `${$moduleName}::MemoryCreated`, fields: {
        id: bcs.Address,
        owner: bcs.Address,
        category: bcs.string(),
        vector_id: bcs.u64()
    } });
export const MemoryIndexUpdated = new MoveStruct({ name: `${$moduleName}::MemoryIndexUpdated`, fields: {
        id: bcs.Address,
        owner: bcs.Address,
        version: bcs.u64(),
        index_blob_id: bcs.string(),
        graph_blob_id: bcs.string()
    } });
export const MemoryMetadataUpdated = new MoveStruct({ name: `${$moduleName}::MemoryMetadataUpdated`, fields: {
        memory_id: bcs.Address,
        metadata_blob_id: bcs.string(),
        embedding_dimension: bcs.u64()
    } });
export const MemoryMetadata = new MoveStruct({ name: `${$moduleName}::MemoryMetadata`, fields: {
        content_type: bcs.string(),
        content_size: bcs.u64(),
        content_hash: bcs.string(),
        category: bcs.string(),
        topic: bcs.string(),
        importance: bcs.u8(),
        embedding_blob_id: bcs.string(),
        embedding_dimension: bcs.u64(),
        created_timestamp: bcs.u64(),
        updated_timestamp: bcs.u64(),
        custom_metadata: vec_map.VecMap(bcs.string(), bcs.string())
    } });
export const MemoryIndex = new MoveStruct({ name: `${$moduleName}::MemoryIndex`, fields: {
        id: object.UID,
        owner: bcs.Address,
        version: bcs.u64(),
        index_blob_id: bcs.string(),
        graph_blob_id: bcs.string()
    } });
export const Memory = new MoveStruct({ name: `${$moduleName}::Memory`, fields: {
        id: object.UID,
        owner: bcs.Address,
        category: bcs.string(),
        vector_id: bcs.u64(),
        blob_id: bcs.string(),
        metadata: MemoryMetadata
    } });
/** Create a new memory index for a user */
export function createMemoryIndex(options) {
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
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Update an existing memory index with new blob IDs */
export function updateMemoryIndex(options) {
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
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Create metadata struct with embedding */
export function createMemoryMetadata(options) {
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
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Create a new memory record with rich metadata */
export function createMemoryRecord(options) {
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
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Update metadata for an existing memory */
export function updateMemoryMetadata(options) {
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
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Add custom metadata field */
export function addCustomMetadata(options) {
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
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Delete a memory record */
export function deleteMemoryRecord(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::Memory`
    ];
    const parameterNames = ["memory"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'delete_memory_record',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export function getIndexBlobId(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::MemoryIndex`
    ];
    const parameterNames = ["memoryIndex"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'get_index_blob_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export function getGraphBlobId(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::MemoryIndex`
    ];
    const parameterNames = ["memoryIndex"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'get_graph_blob_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export function getVersion(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::MemoryIndex`
    ];
    const parameterNames = ["memoryIndex"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'get_version',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export function getMemoryBlobId(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::Memory`
    ];
    const parameterNames = ["memory"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'get_memory_blob_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export function getMemoryVectorId(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::Memory`
    ];
    const parameterNames = ["memory"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'get_memory_vector_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export function getMemoryCategory(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::Memory`
    ];
    const parameterNames = ["memory"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'get_memory_category',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export function getMetadata(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::Memory`
    ];
    const parameterNames = ["memory"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'get_metadata',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export function getEmbeddingBlobId(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::MemoryMetadata`
    ];
    const parameterNames = ["metadata"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'get_embedding_blob_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export function getContentType(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::MemoryMetadata`
    ];
    const parameterNames = ["metadata"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'get_content_type',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export function getContentSize(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::MemoryMetadata`
    ];
    const parameterNames = ["metadata"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'get_content_size',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export function getTopic(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::MemoryMetadata`
    ];
    const parameterNames = ["metadata"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'get_topic',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export function getImportance(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::MemoryMetadata`
    ];
    const parameterNames = ["metadata"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'get_importance',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export function getCreatedTimestamp(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::MemoryMetadata`
    ];
    const parameterNames = ["metadata"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'get_created_timestamp',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export function getUpdatedTimestamp(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::MemoryMetadata`
    ];
    const parameterNames = ["metadata"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'get_updated_timestamp',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export function getCustomMetadata(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::MemoryMetadata`
    ];
    const parameterNames = ["metadata"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'get_custom_metadata',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
//# sourceMappingURL=memory.js.map