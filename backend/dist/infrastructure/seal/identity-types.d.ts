export declare enum IdentityType {
    SELF = "self",
    APP = "app",
    TIME_LOCKED = "time_locked",
    ROLE = "role",
    CONDITIONAL = "conditional"
}
export interface IdentityOptions {
    type: IdentityType;
    userAddress: string;
    targetAddress?: string;
    expiresAt?: number;
    role?: string;
    conditions?: any;
}
export declare function createIdentityString(options: IdentityOptions): string;
