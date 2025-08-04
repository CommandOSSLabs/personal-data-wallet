export interface SessionData {
    address: string;
    personalMessage: string;
    expiresAt: number;
    signature?: string;
}
export declare class SessionStore {
    private sessions;
    set(address: string, data: SessionData): void;
    get(address: string): SessionData | undefined;
    has(address: string): boolean;
    delete(address: string): void;
    clear(): void;
    cleanup(): void;
}
