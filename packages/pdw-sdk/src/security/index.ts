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

// Re-export from infrastructure for backward compatibility
export { SealService } from '../infrastructure/seal';
