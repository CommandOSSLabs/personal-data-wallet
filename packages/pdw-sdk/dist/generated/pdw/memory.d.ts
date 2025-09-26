/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { MoveStruct, type RawTransactionArgument } from '../utils/index';
import { type Transaction } from '@mysten/sui/transactions';
export declare const MemoryCreated: MoveStruct<{
    id: import("@mysten/sui/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    owner: import("@mysten/sui/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    category: import("@mysten/sui/bcs").BcsType<string, string, "string">;
    vector_id: import("@mysten/sui/bcs").BcsType<string, string | number | bigint, "u64">;
}, "@local-pkg/pdw::memory::MemoryCreated">;
export declare const MemoryIndexUpdated: MoveStruct<{
    id: import("@mysten/sui/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    owner: import("@mysten/sui/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    version: import("@mysten/sui/bcs").BcsType<string, string | number | bigint, "u64">;
    index_blob_id: import("@mysten/sui/bcs").BcsType<string, string, "string">;
    graph_blob_id: import("@mysten/sui/bcs").BcsType<string, string, "string">;
}, "@local-pkg/pdw::memory::MemoryIndexUpdated">;
export declare const MemoryMetadataUpdated: MoveStruct<{
    memory_id: import("@mysten/sui/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    metadata_blob_id: import("@mysten/sui/bcs").BcsType<string, string, "string">;
    embedding_dimension: import("@mysten/sui/bcs").BcsType<string, string | number | bigint, "u64">;
}, "@local-pkg/pdw::memory::MemoryMetadataUpdated">;
export declare const MemoryMetadata: MoveStruct<{
    content_type: import("@mysten/sui/bcs").BcsType<string, string, "string">;
    content_size: import("@mysten/sui/bcs").BcsType<string, string | number | bigint, "u64">;
    content_hash: import("@mysten/sui/bcs").BcsType<string, string, "string">;
    category: import("@mysten/sui/bcs").BcsType<string, string, "string">;
    topic: import("@mysten/sui/bcs").BcsType<string, string, "string">;
    importance: import("@mysten/sui/bcs").BcsType<number, number, "u8">;
    embedding_blob_id: import("@mysten/sui/bcs").BcsType<string, string, "string">;
    embedding_dimension: import("@mysten/sui/bcs").BcsType<string, string | number | bigint, "u64">;
    created_timestamp: import("@mysten/sui/bcs").BcsType<string, string | number | bigint, "u64">;
    updated_timestamp: import("@mysten/sui/bcs").BcsType<string, string | number | bigint, "u64">;
    custom_metadata: MoveStruct<{
        contents: import("@mysten/sui/bcs").BcsType<{
            key: string;
            value: string;
        }[], Iterable<{
            key: string;
            value: string;
        }> & {
            length: number;
        }, string>;
    }, "0x2::vec_map::VecMap<string, string>">;
}, "@local-pkg/pdw::memory::MemoryMetadata">;
export declare const MemoryIndex: MoveStruct<{
    id: MoveStruct<{
        id: import("@mysten/sui/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    }, "0x2::object::UID">;
    owner: import("@mysten/sui/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    version: import("@mysten/sui/bcs").BcsType<string, string | number | bigint, "u64">;
    index_blob_id: import("@mysten/sui/bcs").BcsType<string, string, "string">;
    graph_blob_id: import("@mysten/sui/bcs").BcsType<string, string, "string">;
}, "@local-pkg/pdw::memory::MemoryIndex">;
export declare const Memory: MoveStruct<{
    id: MoveStruct<{
        id: import("@mysten/sui/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    }, "0x2::object::UID">;
    owner: import("@mysten/sui/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    category: import("@mysten/sui/bcs").BcsType<string, string, "string">;
    vector_id: import("@mysten/sui/bcs").BcsType<string, string | number | bigint, "u64">;
    blob_id: import("@mysten/sui/bcs").BcsType<string, string, "string">;
    metadata: MoveStruct<{
        content_type: import("@mysten/sui/bcs").BcsType<string, string, "string">;
        content_size: import("@mysten/sui/bcs").BcsType<string, string | number | bigint, "u64">;
        content_hash: import("@mysten/sui/bcs").BcsType<string, string, "string">;
        category: import("@mysten/sui/bcs").BcsType<string, string, "string">;
        topic: import("@mysten/sui/bcs").BcsType<string, string, "string">;
        importance: import("@mysten/sui/bcs").BcsType<number, number, "u8">;
        embedding_blob_id: import("@mysten/sui/bcs").BcsType<string, string, "string">;
        embedding_dimension: import("@mysten/sui/bcs").BcsType<string, string | number | bigint, "u64">;
        created_timestamp: import("@mysten/sui/bcs").BcsType<string, string | number | bigint, "u64">;
        updated_timestamp: import("@mysten/sui/bcs").BcsType<string, string | number | bigint, "u64">;
        custom_metadata: MoveStruct<{
            contents: import("@mysten/sui/bcs").BcsType<{
                key: string;
                value: string;
            }[], Iterable<{
                key: string;
                value: string;
            }> & {
                length: number;
            }, string>;
        }, "0x2::vec_map::VecMap<string, string>">;
    }, "@local-pkg/pdw::memory::MemoryMetadata">;
}, "@local-pkg/pdw::memory::Memory">;
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
export declare function createMemoryIndex(options: CreateMemoryIndexOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
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
export declare function updateMemoryIndex(options: UpdateMemoryIndexOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
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
export declare function createMemoryMetadata(options: CreateMemoryMetadataOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
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
export declare function createMemoryRecord(options: CreateMemoryRecordOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
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
export declare function updateMemoryMetadata(options: UpdateMemoryMetadataOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
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
export declare function addCustomMetadata(options: AddCustomMetadataOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
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
export declare function deleteMemoryRecord(options: DeleteMemoryRecordOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
export interface GetIndexBlobIdArguments {
    memoryIndex: RawTransactionArgument<string>;
}
export interface GetIndexBlobIdOptions {
    package?: string;
    arguments: GetIndexBlobIdArguments | [
        memoryIndex: RawTransactionArgument<string>
    ];
}
export declare function getIndexBlobId(options: GetIndexBlobIdOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
export interface GetGraphBlobIdArguments {
    memoryIndex: RawTransactionArgument<string>;
}
export interface GetGraphBlobIdOptions {
    package?: string;
    arguments: GetGraphBlobIdArguments | [
        memoryIndex: RawTransactionArgument<string>
    ];
}
export declare function getGraphBlobId(options: GetGraphBlobIdOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
export interface GetVersionArguments {
    memoryIndex: RawTransactionArgument<string>;
}
export interface GetVersionOptions {
    package?: string;
    arguments: GetVersionArguments | [
        memoryIndex: RawTransactionArgument<string>
    ];
}
export declare function getVersion(options: GetVersionOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
export interface GetMemoryBlobIdArguments {
    memory: RawTransactionArgument<string>;
}
export interface GetMemoryBlobIdOptions {
    package?: string;
    arguments: GetMemoryBlobIdArguments | [
        memory: RawTransactionArgument<string>
    ];
}
export declare function getMemoryBlobId(options: GetMemoryBlobIdOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
export interface GetMemoryVectorIdArguments {
    memory: RawTransactionArgument<string>;
}
export interface GetMemoryVectorIdOptions {
    package?: string;
    arguments: GetMemoryVectorIdArguments | [
        memory: RawTransactionArgument<string>
    ];
}
export declare function getMemoryVectorId(options: GetMemoryVectorIdOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
export interface GetMemoryCategoryArguments {
    memory: RawTransactionArgument<string>;
}
export interface GetMemoryCategoryOptions {
    package?: string;
    arguments: GetMemoryCategoryArguments | [
        memory: RawTransactionArgument<string>
    ];
}
export declare function getMemoryCategory(options: GetMemoryCategoryOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
export interface GetMetadataArguments {
    memory: RawTransactionArgument<string>;
}
export interface GetMetadataOptions {
    package?: string;
    arguments: GetMetadataArguments | [
        memory: RawTransactionArgument<string>
    ];
}
export declare function getMetadata(options: GetMetadataOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
export interface GetEmbeddingBlobIdArguments {
    metadata: RawTransactionArgument<string>;
}
export interface GetEmbeddingBlobIdOptions {
    package?: string;
    arguments: GetEmbeddingBlobIdArguments | [
        metadata: RawTransactionArgument<string>
    ];
}
export declare function getEmbeddingBlobId(options: GetEmbeddingBlobIdOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
export interface GetContentTypeArguments {
    metadata: RawTransactionArgument<string>;
}
export interface GetContentTypeOptions {
    package?: string;
    arguments: GetContentTypeArguments | [
        metadata: RawTransactionArgument<string>
    ];
}
export declare function getContentType(options: GetContentTypeOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
export interface GetContentSizeArguments {
    metadata: RawTransactionArgument<string>;
}
export interface GetContentSizeOptions {
    package?: string;
    arguments: GetContentSizeArguments | [
        metadata: RawTransactionArgument<string>
    ];
}
export declare function getContentSize(options: GetContentSizeOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
export interface GetTopicArguments {
    metadata: RawTransactionArgument<string>;
}
export interface GetTopicOptions {
    package?: string;
    arguments: GetTopicArguments | [
        metadata: RawTransactionArgument<string>
    ];
}
export declare function getTopic(options: GetTopicOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
export interface GetImportanceArguments {
    metadata: RawTransactionArgument<string>;
}
export interface GetImportanceOptions {
    package?: string;
    arguments: GetImportanceArguments | [
        metadata: RawTransactionArgument<string>
    ];
}
export declare function getImportance(options: GetImportanceOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
export interface GetCreatedTimestampArguments {
    metadata: RawTransactionArgument<string>;
}
export interface GetCreatedTimestampOptions {
    package?: string;
    arguments: GetCreatedTimestampArguments | [
        metadata: RawTransactionArgument<string>
    ];
}
export declare function getCreatedTimestamp(options: GetCreatedTimestampOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
export interface GetUpdatedTimestampArguments {
    metadata: RawTransactionArgument<string>;
}
export interface GetUpdatedTimestampOptions {
    package?: string;
    arguments: GetUpdatedTimestampArguments | [
        metadata: RawTransactionArgument<string>
    ];
}
export declare function getUpdatedTimestamp(options: GetUpdatedTimestampOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
export interface GetCustomMetadataArguments {
    metadata: RawTransactionArgument<string>;
}
export interface GetCustomMetadataOptions {
    package?: string;
    arguments: GetCustomMetadataArguments | [
        metadata: RawTransactionArgument<string>
    ];
}
export declare function getCustomMetadata(options: GetCustomMetadataOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
//# sourceMappingURL=memory.d.ts.map