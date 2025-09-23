import { Transaction } from '@mysten/sui/transactions';
import { normalizeMoveArguments } from '../utils/index.js';

export const MEMORY_PACKAGE_ID = '0x067706fc08339b715dab0383bd853b04d06ef6dff3a642c5e7056222da038bde';

export interface MoveMemoryMetadata {
  content_type: string;
  content_size: string;
  content_hash: string;
  category: string;
  topic: string;
  importance: number;
  embedding_blob_id: string;
  embedding_dimension: string;
  created_timestamp: string;
  updated_timestamp: string;
  custom_metadata: Array<[string, string]>;
}

export interface MoveMemory {
  id: { id: string };
  owner: string;
  category: string;
  vector_id: string;
  blob_id: string;
  metadata: MoveMemoryMetadata;
}

export interface MemoryIndex {
  id: { id: string };
  owner: string;
  version: string;
  index_blob_id: string;
  graph_blob_id: string;
}

export interface MemoryCreated {
  id: string;
  owner: string;
  category: string;
  vector_id: string;
}

export interface CreateMemoryIndexArgs {
  index_blob_id: Uint8Array | string;
  graph_blob_id: Uint8Array | string;
}

export function createMemoryIndex(tx: Transaction, args: CreateMemoryIndexArgs): void {
  const normalizedArgs = normalizeMoveArguments(
    [args.index_blob_id, args.graph_blob_id],
    ['vector<u8>', 'vector<u8>']
  );
  tx.moveCall({
    target: `${MEMORY_PACKAGE_ID}::memory::create_memory_index`,
    arguments: normalizedArgs as any,
  });
}

export interface CreateMemoryRecordArgs {
  category: Uint8Array | string;
  vector_id: string | number;
  blob_id: Uint8Array | string;
  content_type: Uint8Array | string;
  content_size: string | number;
  content_hash: Uint8Array | string;
  topic: Uint8Array | string;
  importance: number;
  embedding_blob_id: Uint8Array | string;
}

export function createMemoryRecord(tx: Transaction, args: CreateMemoryRecordArgs): void {
  const normalizedArgs = normalizeMoveArguments(
    [args.category, args.vector_id, args.blob_id, args.content_type, args.content_size, args.content_hash, args.topic, args.importance, args.embedding_blob_id],
    ['vector<u8>', 'u64', 'vector<u8>', 'vector<u8>', 'u64', 'vector<u8>', 'vector<u8>', 'u8', 'vector<u8>']
  );
  tx.moveCall({
    target: `${MEMORY_PACKAGE_ID}::memory::create_memory_record`,
    arguments: normalizedArgs as any,
  });
}

export function convertStringToVector(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}
