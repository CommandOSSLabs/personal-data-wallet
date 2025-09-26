/**
 * MainWalletService Tests
 * 
 * Tests for the core wallet identity management functionality
 */

import { MainWalletService } from '../../src/wallet/MainWalletService';
import { SuiClient } from '@mysten/sui/client';

// Mock SuiClient for testing
const mockSuiClient = {
  getOwnedObjects: jest.fn(),
  signAndExecuteTransaction: jest.fn(),
} as unknown as SuiClient;

describe('MainWalletService', () => {
  let service: MainWalletService;
  const testPackageId = '0x1234567890abcdef1234567890abcdef12345678';
  
  beforeEach(() => {
    service = new MainWalletService({
      suiClient: mockSuiClient,
      packageId: testPackageId
    });
    
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('getMainWallet', () => {
    it('should return null when no wallet exists', async () => {
      // Mock empty response
      (mockSuiClient.getOwnedObjects as jest.Mock).mockResolvedValue({
        data: []
      });

      const result = await service.getMainWallet('0xuser123');
      expect(result).toBeNull();
    });

    it('should parse main wallet from blockchain response', async () => {
      // Mock wallet object response
      const mockWalletObject = {
        data: {
          objectId: 'wallet_id_123',
          content: {
            dataType: 'moveObject',
            fields: {
              created_at: '1234567890',
              context_salt: 'test_salt_123'
            }
          }
        }
      };

      (mockSuiClient.getOwnedObjects as jest.Mock).mockResolvedValue({
        data: [mockWalletObject]
      });

      const result = await service.getMainWallet('0xuser123');
      
      expect(result).toEqual({
        owner: '0xuser123',
        walletId: 'wallet_id_123',
        createdAt: 1234567890,
        salts: {
          context: 'test_salt_123'
        }
      });
    });
  });

  describe('createMainWallet', () => {
    it('should create a new main wallet with generated salt', async () => {
      const userAddress = '0xuser123';
      
      const result = await service.createMainWallet({
        userAddress
      });

      expect(result.owner).toBe(userAddress);
      expect(result.walletId).toContain('wallet_');
      expect(result.walletId).toContain(userAddress);
      expect(result.salts.context).toBeDefined();
      expect(result.salts.context.length).toBeGreaterThan(0);
      expect(result.createdAt).toBeGreaterThan(0);
    });

    it('should create a main wallet with custom salt', async () => {
      const userAddress = '0xuser123';
      const customSalt = 'custom_test_salt';
      
      const result = await service.createMainWallet({
        userAddress,
        salts: {
          context: customSalt
        }
      });

      expect(result.salts.context).toBe(customSalt);
    });
  });

  describe('deriveContextId', () => {
    it('should derive deterministic context ID', async () => {
      const userAddress = '0xuser123';
      const appId = 'test_app';
      const salt = 'test_salt';

      const contextId1 = await service.deriveContextId({
        userAddress,
        appId,
        salt
      });

      const contextId2 = await service.deriveContextId({
        userAddress,
        appId,
        salt
      });

      // Should be deterministic
      expect(contextId1).toBe(contextId2);
      expect(contextId1).toMatch(/^0x[a-f0-9]{64}$/);
    });

    it('should derive different context IDs for different apps', async () => {
      const userAddress = '0xuser123';
      const salt = 'test_salt';

      const contextId1 = await service.deriveContextId({
        userAddress,
        appId: 'app1',
        salt
      });

      const contextId2 = await service.deriveContextId({
        userAddress,
        appId: 'app2',
        salt
      });

      expect(contextId1).not.toBe(contextId2);
    });

    it('should get salt from main wallet if not provided', async () => {
      const userAddress = '0xuser123';
      const appId = 'test_app';
      const walletSalt = 'wallet_salt_123';

      // Mock main wallet with salt
      const mockWalletObject = {
        data: {
          objectId: 'wallet_id_123',
          content: {
            dataType: 'moveObject',
            fields: {
              created_at: '1234567890',
              context_salt: walletSalt
            }
          }
        }
      };

      (mockSuiClient.getOwnedObjects as jest.Mock).mockResolvedValue({
        data: [mockWalletObject]
      });

      const contextId = await service.deriveContextId({
        userAddress,
        appId
      });

      expect(contextId).toMatch(/^0x[a-f0-9]{64}$/);
      expect(mockSuiClient.getOwnedObjects).toHaveBeenCalledWith({
        owner: userAddress,
        filter: {
          StructType: `${testPackageId}::wallet::MainWallet`
        },
        options: {
          showContent: true,
          showType: true
        }
      });
    });

    it('should throw error if main wallet not found and no salt provided', async () => {
      const userAddress = '0xuser123';
      const appId = 'test_app';

      // Mock no wallet found
      (mockSuiClient.getOwnedObjects as jest.Mock).mockResolvedValue({
        data: []
      });

      await expect(service.deriveContextId({
        userAddress,
        appId
      })).rejects.toThrow('Main wallet not found - create one first');
    });
  });

  describe('rotateKeys', () => {
    it('should rotate keys and return result', async () => {
      const userAddress = '0xuser123';
      
      const result = await service.rotateKeys({
        userAddress,
        sessionKeyTtlMin: 120
      });

      expect(result.sessionKeyId).toContain('session_');
      expect(result.sessionKeyId).toContain(userAddress);
      expect(result.expiresAt).toBeGreaterThan(Date.now());
      expect(result.backupKeyRotated).toBe(true);
    });
  });

  describe('hasMainWallet', () => {
    it('should return true when wallet exists', async () => {
      // Mock wallet exists
      const mockWalletObject = {
        data: {
          objectId: 'wallet_id_123',
          content: {
            dataType: 'moveObject',
            fields: {
              created_at: '1234567890',
              context_salt: 'test_salt'
            }
          }
        }
      };

      (mockSuiClient.getOwnedObjects as jest.Mock).mockResolvedValue({
        data: [mockWalletObject]
      });

      const result = await service.hasMainWallet('0xuser123');
      expect(result).toBe(true);
    });

    it('should return false when wallet does not exist', async () => {
      // Mock no wallet
      (mockSuiClient.getOwnedObjects as jest.Mock).mockResolvedValue({
        data: []
      });

      const result = await service.hasMainWallet('0xuser123');
      expect(result).toBe(false);
    });
  });

  describe('address validation', () => {
    it('should validate Sui address format', async () => {
      const invalidAddress = 'invalid_address';
      
      await expect(service.getMainWalletRequired(invalidAddress))
        .rejects.toThrow('Invalid Sui address format');
    });

    it('should accept valid Sui address format', async () => {
      const validAddress = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      
      // Mock no wallet found
      (mockSuiClient.getOwnedObjects as jest.Mock).mockResolvedValue({
        data: []
      });

      await expect(service.getMainWalletRequired(validAddress))
        .rejects.toThrow('Main wallet not found for address');
    });
  });

  describe('ensureMainWallet', () => {
    it('should return existing wallet if found', async () => {
      const userAddress = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      
      // Mock existing wallet
      const mockWalletObject = {
        data: {
          objectId: 'existing_wallet_123',
          content: {
            dataType: 'moveObject',
            fields: {
              created_at: '1234567890',
              context_salt: 'existing_salt'
            }
          }
        }
      };

      (mockSuiClient.getOwnedObjects as jest.Mock).mockResolvedValue({
        data: [mockWalletObject]
      });

      const result = await service.ensureMainWallet(userAddress);
      
      expect(result.walletId).toBe('existing_wallet_123');
      expect(result.salts.context).toBe('existing_salt');
    });

    it('should create new wallet if not found', async () => {
      const userAddress = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      
      // Mock no existing wallet
      (mockSuiClient.getOwnedObjects as jest.Mock).mockResolvedValue({
        data: []
      });

      const result = await service.ensureMainWallet(userAddress);
      
      expect(result.owner).toBe(userAddress);
      expect(result.walletId).toContain('wallet_');
      expect(result.salts.context).toBeDefined();
    });
  });
});