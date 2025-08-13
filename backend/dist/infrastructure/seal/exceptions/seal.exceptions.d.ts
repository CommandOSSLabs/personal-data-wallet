export declare class SealException extends Error {
    readonly code: string;
    readonly cause?: Error | undefined;
    constructor(message: string, code: string, cause?: Error | undefined);
}
export declare class SealConfigurationException extends SealException {
    constructor(message: string, cause?: Error);
}
export declare class SealEncryptionException extends SealException {
    readonly identity?: string | undefined;
    constructor(message: string, identity?: string | undefined, cause?: Error);
}
export declare class SealDecryptionException extends SealException {
    readonly identity?: string | undefined;
    constructor(message: string, identity?: string | undefined, cause?: Error);
}
export declare class SealKeyServerException extends SealException {
    readonly keyServerId: string;
    readonly url: string;
    constructor(message: string, keyServerId: string, url: string, cause?: Error);
}
export declare class SealThresholdException extends SealException {
    readonly availableServers: number;
    readonly requiredThreshold: number;
    constructor(message: string, availableServers: number, requiredThreshold: number, cause?: Error);
}
export declare class SealSessionException extends SealException {
    readonly identity?: string | undefined;
    constructor(message: string, identity?: string | undefined, cause?: Error);
}
export declare class SealTimeoutException extends SealException {
    readonly operation: string;
    readonly timeoutMs: number;
    constructor(message: string, operation: string, timeoutMs: number, cause?: Error);
}
export declare class SealValidationException extends SealException {
    readonly field: string;
    constructor(message: string, field: string, cause?: Error);
}
export * from './access-control.exceptions';
