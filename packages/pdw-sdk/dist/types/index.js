"use strict";
/**
 * Core TypeScript types for Personal Data Wallet SDK
 *
 * @deprecated This module is deprecated. Import from '@personal-data-wallet/sdk/core/types' instead.
 * This file now re-exports from the core module for backward compatibility.
 *
 * Migration guide:
 * - Old: import { PDWConfig } from '@personal-data-wallet/sdk/types'
 * - New: import { PDWConfig } from '@personal-data-wallet/sdk/core/types'
 */
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
// Re-export all types from core for backward compatibility
__exportStar(require("../core/types/index"), exports);
//# sourceMappingURL=index.js.map