/**
 * Cross-Context Permission Service
 * 
 * Manages cross-context access permissions for the Personal Data Wallet.
 * Enables apps to request and manage access to data from other app contexts.
 */

import { Transaction } from '@mysten/sui/transactions';
import type { SuiClient } from '@mysten/sui/client';
import type { Signer } from '@mysten/sui/cryptography';

export interface CrossContextPermissionConfig {
  packageId: string;
  accessRegistryId: string;
}

export interface GrantCrossContextAccessOptions {
  requestingAppId: string;
  sourceContextId: string;
  accessLevel: 'read' | 'write';
  expiresAt: number; // Unix timestamp in milliseconds
}

export interface RevokeCrossContextAccessOptions {
  requestingAppId: string;
  sourceContextId: string;
}

export interface RegisterContextOptions {
  contextId: string;
  appId: string;
}

export interface CheckCrossContextAccessOptions {
  requestingAppId: string;
  sourceContextId: string;
}

export interface CrossContextPermission {
  requestingAppId: string;
  sourceContextId: string;
  accessLevel: string;
  grantedAt: number;
  expiresAt: number;
  grantedBy: string;
}

/**
 * Service for managing cross-context permissions
 */
export class CrossContextPermissionService {
  private packageId: string;
  private accessRegistryId: string;
  private client: SuiClient;

  constructor(config: CrossContextPermissionConfig, client: SuiClient) {
    this.packageId = config.packageId;
    this.accessRegistryId = config.accessRegistryId;
    this.client = client;
  }

  /**
   * Register a new context wallet for an app
   * 
   * @param options - Context registration options
   * @param signer - Transaction signer
   * @returns Transaction digest
   */
  async registerContext(
    options: RegisterContextOptions,
    signer: Signer
  ): Promise<string> {
    const tx = this.buildRegisterContextTransaction(options);
    
    const result = await this.client.signAndExecuteTransaction({
      transaction: tx,
      signer,
      options: {
        showEffects: true,
        showEvents: true,
      },
    });

    if (result.effects?.status?.status !== 'success') {
      throw new Error(`Failed to register context: ${result.effects?.status?.error}`);
    }

    return result.digest;
  }

  /**
   * Build transaction to register a context wallet
   * 
   * @param options - Context registration options
   * @returns Transaction object
   */
  buildRegisterContextTransaction(options: RegisterContextOptions): Transaction {
    const tx = new Transaction();

    // Get clock object
    tx.moveCall({
      target: `${this.packageId}::seal_access_control::register_context`,
      arguments: [
        tx.object(this.accessRegistryId),
        tx.pure.string(options.contextId),
        tx.pure.string(options.appId),
        tx.object('0x6'), // Clock object
      ],
    });

    return tx;
  }

  /**
   * Grant cross-context access permission
   * 
   * @param options - Permission grant options
   * @param signer - Transaction signer
   * @returns Transaction digest
   */
  async grantCrossContextAccess(
    options: GrantCrossContextAccessOptions,
    signer: Signer
  ): Promise<string> {
    const tx = this.buildGrantCrossContextAccessTransaction(options);
    
    const result = await this.client.signAndExecuteTransaction({
      transaction: tx,
      signer,
      options: {
        showEffects: true,
        showEvents: true,
      },
    });

    if (result.effects?.status?.status !== 'success') {
      throw new Error(`Failed to grant access: ${result.effects?.status?.error}`);
    }

    return result.digest;
  }

  /**
   * Build transaction to grant cross-context access
   * 
   * @param options - Permission grant options
   * @returns Transaction object
   */
  buildGrantCrossContextAccessTransaction(
    options: GrantCrossContextAccessOptions
  ): Transaction {
    const tx = new Transaction();

    tx.moveCall({
      target: `${this.packageId}::seal_access_control::grant_cross_context_access`,
      arguments: [
        tx.object(this.accessRegistryId),
        tx.pure.string(options.requestingAppId),
        tx.pure.string(options.sourceContextId),
        tx.pure.string(options.accessLevel),
        tx.pure.u64(options.expiresAt),
        tx.object('0x6'), // Clock object
      ],
    });

    return tx;
  }

  /**
   * Revoke cross-context access permission
   * 
   * @param options - Permission revocation options
   * @param signer - Transaction signer
   * @returns Transaction digest
   */
  async revokeCrossContextAccess(
    options: RevokeCrossContextAccessOptions,
    signer: Signer
  ): Promise<string> {
    const tx = this.buildRevokeCrossContextAccessTransaction(options);
    
    const result = await this.client.signAndExecuteTransaction({
      transaction: tx,
      signer,
      options: {
        showEffects: true,
        showEvents: true,
      },
    });

    if (result.effects?.status?.status !== 'success') {
      throw new Error(`Failed to revoke access: ${result.effects?.status?.error}`);
    }

    return result.digest;
  }

  /**
   * Build transaction to revoke cross-context access
   * 
   * @param options - Permission revocation options
   * @returns Transaction object
   */
  buildRevokeCrossContextAccessTransaction(
    options: RevokeCrossContextAccessOptions
  ): Transaction {
    const tx = new Transaction();

    tx.moveCall({
      target: `${this.packageId}::seal_access_control::revoke_cross_context_access`,
      arguments: [
        tx.object(this.accessRegistryId),
        tx.pure.string(options.requestingAppId),
        tx.pure.string(options.sourceContextId),
      ],
    });

    return tx;
  }

  /**
   * Build seal_approve transaction with app_id parameter
   * 
   * @param contentId - Content identifier (SEAL key ID bytes)
   * @param requestingAppId - App requesting decryption
   * @returns Transaction object
   */
  buildSealApproveTransaction(
    contentId: Uint8Array,
    requestingAppId: string
  ): Transaction {
    const tx = new Transaction();

    tx.moveCall({
      target: `${this.packageId}::seal_access_control::seal_approve`,
      arguments: [
        tx.pure.vector('u8', Array.from(contentId)),
        tx.pure.string(requestingAppId),
        tx.object(this.accessRegistryId),
        tx.object('0x6'), // Clock object
      ],
    });

    return tx;
  }

  /**
   * Query cross-context permissions for an app
   * 
   * Note: This requires querying events or implementing a view function
   * For now, returns events filtered by app
   * 
   * @param requestingAppId - App to query permissions for
   * @param sourceContextId - Optional context to filter by
   * @returns List of permissions
   */
  async queryPermissions(
    requestingAppId: string,
    sourceContextId?: string
  ): Promise<CrossContextPermission[]> {
    // Query CrossContextAccessChanged events
    const events = await this.client.queryEvents({
      query: {
        MoveEventType: `${this.packageId}::seal_access_control::CrossContextAccessChanged`,
      },
      limit: 100,
    });

    const permissions: CrossContextPermission[] = [];

    for (const event of events.data) {
      const parsedEvent = event.parsedJson as any;
      
      // Filter by requesting app and context
      if (parsedEvent.requesting_app_id === requestingAppId) {
        if (!sourceContextId || parsedEvent.source_context_id === sourceContextId) {
          // Only include if granted (not revoked)
          if (parsedEvent.granted) {
            permissions.push({
              requestingAppId: parsedEvent.requesting_app_id,
              sourceContextId: parsedEvent.source_context_id,
              accessLevel: parsedEvent.access_level,
              grantedAt: Number(event.timestampMs),
              expiresAt: Number(parsedEvent.expires_at),
              grantedBy: parsedEvent.granted_by,
            });
          }
        }
      }
    }

    return permissions;
  }

  /**
   * Check if an app has permission to access a context
   * 
   * @param options - Check permission options
   * @returns True if permission exists and is not expired
   */
  async hasPermission(options: CheckCrossContextAccessOptions): Promise<boolean> {
    const permissions = await this.queryPermissions(
      options.requestingAppId,
      options.sourceContextId
    );

    const now = Date.now();
    return permissions.some(p => 
      p.sourceContextId === options.sourceContextId && 
      p.expiresAt > now
    );
  }

  /**
   * Get all contexts that an app has access to
   * 
   * @param requestingAppId - App to query
   * @returns List of accessible context IDs
   */
  async getAccessibleContexts(requestingAppId: string): Promise<string[]> {
    const permissions = await this.queryPermissions(requestingAppId);
    const now = Date.now();

    return permissions
      .filter(p => p.expiresAt > now)
      .map(p => p.sourceContextId);
  }
}
