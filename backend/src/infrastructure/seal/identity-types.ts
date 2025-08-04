/**
 * Identity types for SEAL IBE encryption
 */

export enum IdentityType {
  SELF = 'self',              // User encrypts for themselves
  APP = 'app',                // User encrypts for a specific app
  TIME_LOCKED = 'time_locked', // Time-based access
  ROLE = 'role',              // Role-based access
  CONDITIONAL = 'conditional'  // Conditional access with custom logic
}

export interface IdentityOptions {
  type: IdentityType;
  userAddress: string;
  targetAddress?: string;    // For APP type: the app's address
  expiresAt?: number;        // For TIME_LOCKED: unix timestamp
  role?: string;             // For ROLE type: role identifier
  conditions?: any;          // For CONDITIONAL: custom conditions
}

/**
 * Create an identity string based on the type and options
 */
export function createIdentityString(options: IdentityOptions): string {
  switch (options.type) {
    case IdentityType.SELF:
      // Original format: [packageId][userAddress]
      return `self:${options.userAddress}`;
    
    case IdentityType.APP:
      // Format: [packageId][userAddress:app:appAddress]
      if (!options.targetAddress) {
        throw new Error('Target app address required for APP identity type');
      }
      return `app:${options.userAddress}:${options.targetAddress}`;
    
    case IdentityType.TIME_LOCKED:
      // Format: [packageId][userAddress:time:timestamp]
      if (!options.expiresAt) {
        throw new Error('Expiration timestamp required for TIME_LOCKED identity type');
      }
      return `time:${options.userAddress}:${options.expiresAt}`;
    
    case IdentityType.ROLE:
      // Format: [packageId][userAddress:role:roleId]
      if (!options.role) {
        throw new Error('Role identifier required for ROLE identity type');
      }
      return `role:${options.userAddress}:${options.role}`;
    
    case IdentityType.CONDITIONAL:
      // Format: [packageId][userAddress:cond:hash]
      const condHash = options.conditions ? 
        Buffer.from(JSON.stringify(options.conditions)).toString('hex').substring(0, 16) : 
        '0000000000000000';
      return `cond:${options.userAddress}:${condHash}`;
    
    default:
      throw new Error(`Unknown identity type: ${options.type}`);
  }
}