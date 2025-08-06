import * as hnswlib from 'hnswlib-node';
import { WalrusService } from '../../infrastructure/walrus/walrus.service';
export declare class HnswIndexService {
    private walrusService;
    private logger;
    constructor(walrusService: WalrusService);
    createIndex(dimensions?: number, maxElements?: number): Promise<{
        index: hnswlib.HierarchicalNSW;
        serialized: Buffer;
    }>;
    addVectorToIndex(index: hnswlib.HierarchicalNSW, id: number, vector: number[]): void;
    searchIndex(index: hnswlib.HierarchicalNSW, vector: number[], k: number): {
        ids: number[];
        distances: number[];
    };
    saveIndex(index: hnswlib.HierarchicalNSW, userAddress: string): Promise<string>;
    loadIndex(blobId: string, userAddress?: string): Promise<{
        index: hnswlib.HierarchicalNSW;
        serialized: Buffer;
    }>;
    getIndexSize(index: hnswlib.HierarchicalNSW): number;
    removeVectorFromIndex(index: hnswlib.HierarchicalNSW, id: number): void;
}
