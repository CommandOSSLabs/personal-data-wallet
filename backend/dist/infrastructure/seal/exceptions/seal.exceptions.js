"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SealValidationException = exports.SealTimeoutException = exports.SealSessionException = exports.SealThresholdException = exports.SealKeyServerException = exports.SealDecryptionException = exports.SealEncryptionException = exports.SealConfigurationException = exports.SealException = void 0;
class SealException extends Error {
    code;
    cause;
    constructor(message, code, cause) {
        super(message);
        this.code = code;
        this.cause = cause;
        this.name = 'SealException';
    }
}
exports.SealException = SealException;
class SealConfigurationException extends SealException {
    constructor(message, cause) {
        super(message, 'SEAL_CONFIG_ERROR', cause);
        this.name = 'SealConfigurationException';
    }
}
exports.SealConfigurationException = SealConfigurationException;
class SealEncryptionException extends SealException {
    identity;
    constructor(message, identity, cause) {
        super(message, 'SEAL_ENCRYPTION_ERROR', cause);
        this.identity = identity;
        this.name = 'SealEncryptionException';
    }
}
exports.SealEncryptionException = SealEncryptionException;
class SealDecryptionException extends SealException {
    identity;
    constructor(message, identity, cause) {
        super(message, 'SEAL_DECRYPTION_ERROR', cause);
        this.identity = identity;
        this.name = 'SealDecryptionException';
    }
}
exports.SealDecryptionException = SealDecryptionException;
class SealKeyServerException extends SealException {
    keyServerId;
    url;
    constructor(message, keyServerId, url, cause) {
        super(message, 'SEAL_KEY_SERVER_ERROR', cause);
        this.keyServerId = keyServerId;
        this.url = url;
        this.name = 'SealKeyServerException';
    }
}
exports.SealKeyServerException = SealKeyServerException;
class SealThresholdException extends SealException {
    availableServers;
    requiredThreshold;
    constructor(message, availableServers, requiredThreshold, cause) {
        super(message, 'SEAL_THRESHOLD_ERROR', cause);
        this.availableServers = availableServers;
        this.requiredThreshold = requiredThreshold;
        this.name = 'SealThresholdException';
    }
}
exports.SealThresholdException = SealThresholdException;
class SealSessionException extends SealException {
    identity;
    constructor(message, identity, cause) {
        super(message, 'SEAL_SESSION_ERROR', cause);
        this.identity = identity;
        this.name = 'SealSessionException';
    }
}
exports.SealSessionException = SealSessionException;
class SealTimeoutException extends SealException {
    operation;
    timeoutMs;
    constructor(message, operation, timeoutMs, cause) {
        super(message, 'SEAL_TIMEOUT_ERROR', cause);
        this.operation = operation;
        this.timeoutMs = timeoutMs;
        this.name = 'SealTimeoutException';
    }
}
exports.SealTimeoutException = SealTimeoutException;
class SealValidationException extends SealException {
    field;
    constructor(message, field, cause) {
        super(message, 'SEAL_VALIDATION_ERROR', cause);
        this.field = field;
        this.name = 'SealValidationException';
    }
}
exports.SealValidationException = SealValidationException;
__exportStar(require("./access-control.exceptions"), exports);
//# sourceMappingURL=seal.exceptions.js.map