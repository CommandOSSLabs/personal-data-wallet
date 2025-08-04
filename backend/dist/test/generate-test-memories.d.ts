interface TestMemory {
    content: string;
    category: string;
    metadata: {
        generated: boolean;
        timestamp: string;
        source: string;
        sensitive?: boolean;
    };
}
export declare function generateTestMemories(): Promise<TestMemory[]>;
export {};
