/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { MoveStruct, normalizeMoveArguments, type RawTransactionArgument } from '../utils/index.js';
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
import * as vec_map from '~root/deps/sui/vec_map.js';
import * as object from '~root/deps/sui/object.js';
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
export interface CreateMemoryIndexArguments {
    indexBlobId: RawTransactionArgument<number[]>;
    graphBlobId: RawTransactionArgument<number[]>;
}
export interface CreateMemoryIndexOptions {
    package?: string;
    arguments: CreateMemoryIndexArguments | [
        indexBlobId: RawTransactionArgument<number[]>,
        graphBlobId: RawTransactionArgument<number[]>
    ];
}
/** Create a new memory index for a user */
export function createMemoryIndex(options: CreateMemoryIndexOptions) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        'vector<u8>',
        'vector<u8>'
    ] satisfies string[];
    const parameterNames = ["indexBlobId", "graphBlobId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'create_memory_index',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface UpdateMemoryIndexArguments {
    memoryIndex: RawTransactionArgument<string>;
    expectedVersion: RawTransactionArgument<number | bigint>;
    newIndexBlobId: RawTransactionArgument<number[]>;
    newGraphBlobId: RawTransactionArgument<number[]>;
}
export interface UpdateMemoryIndexOptions {
    package?: string;
    arguments: UpdateMemoryIndexArguments | [
        memoryIndex: RawTransactionArgument<string>,
        expectedVersion: RawTransactionArgument<number | bigint>,
        newIndexBlobId: RawTransactionArgument<number[]>,
        newGraphBlobId: RawTransactionArgument<number[]>
    ];
}
/** Update an existing memory index with new blob IDs */
export function updateMemoryIndex(options: UpdateMemoryIndexOptions) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::MemoryIndex`,
        'u64',
        'vector<u8>',
        'vector<u8>'
    ] satisfies string[];
    const parameterNames = ["memoryIndex", "expectedVersion", "newIndexBlobId", "newGraphBlobId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'update_memory_index',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface CreateMemoryMetadataArguments {
    contentType: RawTransactionArgument<number[]>;
    contentSize: RawTransactionArgument<number | bigint>;
    contentHash: RawTransactionArgument<number[]>;
    category: RawTransactionArgument<number[]>;
    topic: RawTransactionArgument<number[]>;
    importance: RawTransactionArgument<number>;
    embeddingBlobId: RawTransactionArgument<number[]>;
    embeddingDimension: RawTransactionArgument<number | bigint>;
    createdTimestamp: RawTransactionArgument<number | bigint>;
}
export interface CreateMemoryMetadataOptions {
    package?: string;
    arguments: CreateMemoryMetadataArguments | [
        contentType: RawTransactionArgument<number[]>,
        contentSize: RawTransactionArgument<number | bigint>,
        contentHash: RawTransactionArgument<number[]>,
        category: RawTransactionArgument<number[]>,
        topic: RawTransactionArgument<number[]>,
        importance: RawTransactionArgument<number>,
        embeddingBlobId: RawTransactionArgument<number[]>,
        embeddingDimension: RawTransactionArgument<number | bigint>,
        createdTimestamp: RawTransactionArgument<number | bigint>
    ];
}
/** Create metadata struct with embedding */
export function createMemoryMetadata(options: CreateMemoryMetadataOptions) {
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
    ] satisfies string[];
    const parameterNames = ["contentType", "contentSize", "contentHash", "category", "topic", "importance", "embeddingBlobId", "embeddingDimension", "createdTimestamp"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'create_memory_metadata',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface CreateMemoryRecordArguments {
    category: RawTransactionArgument<number[]>;
    vectorId: RawTransactionArgument<number | bigint>;
    blobId: RawTransactionArgument<number[]>;
    contentType: RawTransactionArgument<number[]>;
    contentSize: RawTransactionArgument<number | bigint>;
    contentHash: RawTransactionArgument<number[]>;
    topic: RawTransactionArgument<number[]>;
    importance: RawTransactionArgument<number>;
    embeddingBlobId: RawTransactionArgument<number[]>;
}
export interface CreateMemoryRecordOptions {
    package?: string;
    arguments: CreateMemoryRecordArguments | [
        category: RawTransactionArgument<number[]>,
        vectorId: RawTransactionArgument<number | bigint>,
        blobId: RawTransactionArgument<number[]>,
        contentType: RawTransactionArgument<number[]>,
        contentSize: RawTransactionArgument<number | bigint>,
        contentHash: RawTransactionArgument<number[]>,
        topic: RawTransactionArgument<number[]>,
        importance: RawTransactionArgument<number>,
        embeddingBlobId: RawTransactionArgument<number[]>
    ];
}
/** Create a new memory record with rich metadata */
export function createMemoryRecord(options: CreateMemoryRecordOptions) {
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
    ] satisfies string[];
    const parameterNames = ["category", "vectorId", "blobId", "contentType", "contentSize", "contentHash", "topic", "importance", "embeddingBlobId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'create_memory_record',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface UpdateMemoryMetadataArguments {
    memory: RawTransactionArgument<string>;
    newTopic: RawTransactionArgument<number[]>;
    newImportance: RawTransactionArgument<number>;
}
export interface UpdateMemoryMetadataOptions {
    package?: string;
    arguments: UpdateMemoryMetadataArguments | [
        memory: RawTransactionArgument<string>,
        newTopic: RawTransactionArgument<number[]>,
        newImportance: RawTransactionArgument<number>
    ];
}
/** Update metadata for an existing memory */
export function updateMemoryMetadata(options: UpdateMemoryMetadataOptions) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::Memory`,
        'vector<u8>',
        'u8'
    ] satisfies string[];
    const parameterNames = ["memory", "newTopic", "newImportance"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'update_memory_metadata',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface AddCustomMetadataArguments {
    memory: RawTransactionArgument<string>;
    key: RawTransactionArgument<number[]>;
    value: RawTransactionArgument<number[]>;
}
export interface AddCustomMetadataOptions {
    package?: string;
    arguments: AddCustomMetadataArguments | [
        memory: RawTransactionArgument<string>,
        key: RawTransactionArgument<number[]>,
        value: RawTransactionArgument<number[]>
    ];
}
/** Add custom metadata field */
export function addCustomMetadata(options: AddCustomMetadataOptions) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::Memory`,
        'vector<u8>',
        'vector<u8>'
    ] satisfies string[];
    const parameterNames = ["memory", "key", "value"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'add_custom_metadata',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface DeleteMemoryRecordArguments {
    memory: RawTransactionArgument<string>;
}
export interface DeleteMemoryRecordOptions {
    package?: string;
    arguments: DeleteMemoryRecordArguments | [
        memory: RawTransactionArgument<string>
    ];
}
/** Delete a memory record */
export function deleteMemoryRecord(options: DeleteMemoryRecordOptions) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::Memory`
    ] satisfies string[];
    const parameterNames = ["memory"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'delete_memory_record',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface GetIndexBlobIdArguments {
    memoryIndex: RawTransactionArgument<string>;
}
export interface GetIndexBlobIdOptions {
    package?: string;
    arguments: GetIndexBlobIdArguments | [
        memoryIndex: RawTransactionArgument<string>
    ];
}
export function getIndexBlobId(options: GetIndexBlobIdOptions) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::MemoryIndex`
    ] satisfies string[];
    const parameterNames = ["memoryIndex"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'get_index_blob_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface GetGraphBlobIdArguments {
    memoryIndex: RawTransactionArgument<string>;
}
export interface GetGraphBlobIdOptions {
    package?: string;
    arguments: GetGraphBlobIdArguments | [
        memoryIndex: RawTransactionArgument<string>
    ];
}
export function getGraphBlobId(options: GetGraphBlobIdOptions) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::MemoryIndex`
    ] satisfies string[];
    const parameterNames = ["memoryIndex"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'get_graph_blob_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface GetVersionArguments {
    memoryIndex: RawTransactionArgument<string>;
}
export interface GetVersionOptions {
    package?: string;
    arguments: GetVersionArguments | [
        memoryIndex: RawTransactionArgument<string>
    ];
}
export function getVersion(options: GetVersionOptions) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::MemoryIndex`
    ] satisfies string[];
    const parameterNames = ["memoryIndex"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'get_version',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface GetMemoryBlobIdArguments {
    memory: RawTransactionArgument<string>;
}
export interface GetMemoryBlobIdOptions {
    package?: string;
    arguments: GetMemoryBlobIdArguments | [
        memory: RawTransactionArgument<string>
    ];
}
export function getMemoryBlobId(options: GetMemoryBlobIdOptions) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::Memory`
    ] satisfies string[];
    const parameterNames = ["memory"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'get_memory_blob_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface GetMemoryVectorIdArguments {
    memory: RawTransactionArgument<string>;
}
export interface GetMemoryVectorIdOptions {
    package?: string;
    arguments: GetMemoryVectorIdArguments | [
        memory: RawTransactionArgument<string>
    ];
}
export function getMemoryVectorId(options: GetMemoryVectorIdOptions) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::Memory`
    ] satisfies string[];
    const parameterNames = ["memory"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'get_memory_vector_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface GetMemoryCategoryArguments {
    memory: RawTransactionArgument<string>;
}
export interface GetMemoryCategoryOptions {
    package?: string;
    arguments: GetMemoryCategoryArguments | [
        memory: RawTransactionArgument<string>
    ];
}
export function getMemoryCategory(options: GetMemoryCategoryOptions) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::Memory`
    ] satisfies string[];
    const parameterNames = ["memory"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'get_memory_category',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface GetMetadataArguments {
    memory: RawTransactionArgument<string>;
}
export interface GetMetadataOptions {
    package?: string;
    arguments: GetMetadataArguments | [
        memory: RawTransactionArgument<string>
    ];
}
export function getMetadata(options: GetMetadataOptions) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::Memory`
    ] satisfies string[];
    const parameterNames = ["memory"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'get_metadata',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface GetEmbeddingBlobIdArguments {
    metadata: RawTransactionArgument<string>;
}
export interface GetEmbeddingBlobIdOptions {
    package?: string;
    arguments: GetEmbeddingBlobIdArguments | [
        metadata: RawTransactionArgument<string>
    ];
}
export function getEmbeddingBlobId(options: GetEmbeddingBlobIdOptions) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::MemoryMetadata`
    ] satisfies string[];
    const parameterNames = ["metadata"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'get_embedding_blob_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface GetContentTypeArguments {
    metadata: RawTransactionArgument<string>;
}
export interface GetContentTypeOptions {
    package?: string;
    arguments: GetContentTypeArguments | [
        metadata: RawTransactionArgument<string>
    ];
}
export function getContentType(options: GetContentTypeOptions) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::MemoryMetadata`
    ] satisfies string[];
    const parameterNames = ["metadata"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'get_content_type',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface GetContentSizeArguments {
    metadata: RawTransactionArgument<string>;
}
export interface GetContentSizeOptions {
    package?: string;
    arguments: GetContentSizeArguments | [
        metadata: RawTransactionArgument<string>
    ];
}
export function getContentSize(options: GetContentSizeOptions) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::MemoryMetadata`
    ] satisfies string[];
    const parameterNames = ["metadata"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'get_content_size',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface GetTopicArguments {
    metadata: RawTransactionArgument<string>;
}
export interface GetTopicOptions {
    package?: string;
    arguments: GetTopicArguments | [
        metadata: RawTransactionArgument<string>
    ];
}
export function getTopic(options: GetTopicOptions) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::MemoryMetadata`
    ] satisfies string[];
    const parameterNames = ["metadata"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'get_topic',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface GetImportanceArguments {
    metadata: RawTransactionArgument<string>;
}
export interface GetImportanceOptions {
    package?: string;
    arguments: GetImportanceArguments | [
        metadata: RawTransactionArgument<string>
    ];
}
export function getImportance(options: GetImportanceOptions) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::MemoryMetadata`
    ] satisfies string[];
    const parameterNames = ["metadata"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'get_importance',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface GetCreatedTimestampArguments {
    metadata: RawTransactionArgument<string>;
}
export interface GetCreatedTimestampOptions {
    package?: string;
    arguments: GetCreatedTimestampArguments | [
        metadata: RawTransactionArgument<string>
    ];
}
export function getCreatedTimestamp(options: GetCreatedTimestampOptions) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::MemoryMetadata`
    ] satisfies string[];
    const parameterNames = ["metadata"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'get_created_timestamp',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface GetUpdatedTimestampArguments {
    metadata: RawTransactionArgument<string>;
}
export interface GetUpdatedTimestampOptions {
    package?: string;
    arguments: GetUpdatedTimestampArguments | [
        metadata: RawTransactionArgument<string>
    ];
}
export function getUpdatedTimestamp(options: GetUpdatedTimestampOptions) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::MemoryMetadata`
    ] satisfies string[];
    const parameterNames = ["metadata"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'get_updated_timestamp',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface GetCustomMetadataArguments {
    metadata: RawTransactionArgument<string>;
}
export interface GetCustomMetadataOptions {
    package?: string;
    arguments: GetCustomMetadataArguments | [
        metadata: RawTransactionArgument<string>
    ];
}
export function getCustomMetadata(options: GetCustomMetadataOptions) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::memory::MemoryMetadata`
    ] satisfies string[];
    const parameterNames = ["metadata"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'memory',
        function: 'get_custom_metadata',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}