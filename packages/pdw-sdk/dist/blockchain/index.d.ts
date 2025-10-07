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
export { SuiService, BlockchainManager } from '../infrastructure/sui';
export type { SuiConfig, MemoryRecord, MemoryIndex, MemoryMetadata, TransactionResult, BatchTransaction, SuiStats } from '../infrastructure/sui/SuiService';
export type { BlockchainManagerConfig, MemoryOwnershipRecord, IndexOwnershipRecord, BlockchainOperation, OwnershipVerification, BlockchainStats } from '../infrastructure/sui/BlockchainManager';
//# sourceMappingURL=index.d.ts.map