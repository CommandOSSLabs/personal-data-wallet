export interface Memory {
    id: string;
    content: string;
    category: string;
    timestamp: string;
    isEncrypted: boolean;
    owner: string;
    similarity_score?: number;
    walrusHash?: string;
}
