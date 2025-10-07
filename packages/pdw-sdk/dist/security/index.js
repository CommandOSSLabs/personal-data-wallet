"use strict";
/**
 * Security Module - Barrel Export
 *
 * @deprecated Import from '@personal-data-wallet/sdk/infrastructure/seal' instead
 * This file now re-exports from the infrastructure module for backward compatibility.
 *
 * Migration guide:
 * - Old: import { SealService } from '@personal-data-wallet/sdk/security'
 * - New: import { SealService } from '@personal-data-wallet/sdk/infrastructure/seal'
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SealService = void 0;
// Re-export from infrastructure for backward compatibility
var seal_1 = require("../infrastructure/seal");
Object.defineProperty(exports, "SealService", { enumerable: true, get: function () { return seal_1.SealService; } });
//# sourceMappingURL=index.js.map