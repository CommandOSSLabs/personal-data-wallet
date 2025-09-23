import { normalizeMoveArguments } from '../utils/index.js';
export const MEMORY_PACKAGE_ID = '0x067706fc08339b715dab0383bd853b04d06ef6dff3a642c5e7056222da038bde';
export function createMemoryIndex(tx, args) {
    const normalizedArgs = normalizeMoveArguments([args.index_blob_id, args.graph_blob_id], ['vector<u8>', 'vector<u8>']);
    tx.moveCall({
        target: `${MEMORY_PACKAGE_ID}::memory::create_memory_index`,
        arguments: normalizedArgs,
    });
}
export function createMemoryRecord(tx, args) {
    const normalizedArgs = normalizeMoveArguments([args.category, args.vector_id, args.blob_id, args.content_type, args.content_size, args.content_hash, args.topic, args.importance, args.embedding_blob_id], ['vector<u8>', 'u64', 'vector<u8>', 'vector<u8>', 'u64', 'vector<u8>', 'vector<u8>', 'u8', 'vector<u8>']);
    tx.moveCall({
        target: `${MEMORY_PACKAGE_ID}::memory::create_memory_record`,
        arguments: normalizedArgs,
    });
}
export function convertStringToVector(str) {
    return new TextEncoder().encode(str);
}
//# sourceMappingURL=index.js.map