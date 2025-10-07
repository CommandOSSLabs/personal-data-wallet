"use strict";
/**
 * Blockchain Module - DEPRECATED
 *
 * @deprecated Import from '@personal-data-wallet/sdk/infrastructure/sui' instead
 * This file now re-exports from the infrastructure module for backward compatibility.
 *
 * Migration guide:
 * - Old: import { SuiService } from '@personal-data-wallet/sdk/blockchain'
 * - New: import { SuiService } from '@personal-data-wallet/sdk/infrastructure/sui'
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainManager = exports.SuiService = void 0;
// Re-export from infrastructure for backward compatibility
var sui_1 = require("../infrastructure/sui");
Object.defineProperty(exports, "SuiService", { enumerable: true, get: function () { return sui_1.SuiService; } });
Object.defineProperty(exports, "BlockchainManager", { enumerable: true, get: function () { return sui_1.BlockchainManager; } });
//# sourceMappingURL=index.js.map