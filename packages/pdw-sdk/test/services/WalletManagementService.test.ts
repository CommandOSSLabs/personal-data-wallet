/**
 * WalletManagementService Tests
 * 
 * Tests for MainWallet and ContextWallet creation, retrieval, and management.
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { WalletManagementService } from '../../src/services/WalletManagementService';
import { fromHex } from '@mysten/sui/utils';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

describe('WalletManagementService', () => {
  let client: SuiClient;
  let service: WalletManagementService;
  let keypair: Ed25519Keypair;
  let userAddress: string;

  beforeAll(() => {
    const privateKeyHex = process.env.TEST_PRIVATE_KEY;
    if (!privateKeyHex) {
      throw new Error('TEST_PRIVATE_KEY not found in .env.test');
    }

    // Handle both hex and suiprivkey formats
    if (privateKeyHex.startsWith('suiprivkey')) {
      // Use Sui private key format directly
      keypair = Ed25519Keypair.fromSecretKey(privateKeyHex);
    } else {
      // Handle hex format
      const cleanHex = privateKeyHex.replace('0x', '');
      keypair = Ed25519Keypair.fromSecretKey(fromHex(cleanHex));
    }
    
    userAddress = keypair.getPublicKey().toSuiAddress();

    client = new SuiClient({
      url: getFullnodeUrl('testnet'),
    });

    const packageId = process.env.PACKAGE_ID;
    const walletRegistryId = process.env.WALLET_REGISTRY_ID;

    if (!packageId || !walletRegistryId) {
      throw new Error('PACKAGE_ID or WALLET_REGISTRY_ID not found in .env.test');
    }

    service = new WalletManagementService(
      {
        packageId,
        walletRegistryId,
      },
      client
    );
  });

  describe('MainWallet Creation', () => {
    it('should create a new MainWallet', async () => {
      const result = await service.createMainWallet(keypair);

      expect(result).toHaveProperty('digest');
      expect(result).toHaveProperty('walletId');
      expect(result.walletId).toMatch(/^0x[a-fA-F0-9]+$/);

      console.log('✅ Created MainWallet:', result.walletId);
    }, 60000);

    it('should build a MainWallet creation transaction', () => {
      const tx = service.buildCreateMainWalletTransaction();

      expect(tx).toBeDefined();
      // Transaction class is _Transaction in @mysten/sui v4.x
      expect(tx.constructor.name).toMatch(/Transaction/);
    });

    it('should retrieve MainWallet by object ID', async () => {
      // Create a new wallet first
      const { walletId } = await service.createMainWallet(keypair);

      // Retrieve it
      const wallet = await service.getMainWallet(walletId);

      expect(wallet).not.toBeNull();
      expect(wallet?.id).toBe(walletId);
      expect(wallet?.owner).toBe(userAddress);
      expect(wallet?.contextSalt).toMatch(/^0x[a-fA-F0-9]+$/);
      expect(wallet?.version).toBe(1);

      console.log('✅ Retrieved MainWallet:', {
        id: wallet?.id,
        owner: wallet?.owner,
        createdAt: wallet?.createdAt,
        saltLength: wallet?.contextSalt.length,
      });
    }, 60000);

    it('should get all MainWallets owned by user', async () => {
      const wallets = await service.getMainWalletsByOwner(userAddress);

      expect(wallets).toBeInstanceOf(Array);
      expect(wallets.length).toBeGreaterThan(0);

      wallets.forEach((wallet) => {
        expect(wallet.owner).toBe(userAddress);
        expect(wallet.contextSalt).toMatch(/^0x[a-fA-F0-9]+$/);
      });

      console.log(`✅ Found ${wallets.length} MainWallet(s) for user`);
    }, 60000);

    it('should check if user has a MainWallet', async () => {
      const hasWallet = await service.hasMainWallet(userAddress);

      expect(typeof hasWallet).toBe('boolean');
      expect(hasWallet).toBe(true); // Should be true after previous tests

      console.log('✅ User has MainWallet:', hasWallet);
    }, 60000);

    it('should get or create MainWallet (return existing)', async () => {
      const wallet = await service.getOrCreateMainWallet(userAddress, keypair);

      expect(wallet).toBeDefined();
      expect(wallet.owner).toBe(userAddress);

      console.log('✅ Got or created MainWallet:', wallet.id);
    }, 60000);
  });

  describe('ContextWallet Creation', () => {
    let mainWalletId: string;

    beforeAll(async () => {
      // Ensure we have a MainWallet
      const wallets = await service.getMainWalletsByOwner(userAddress);
      if (wallets.length > 0) {
        mainWalletId = wallets[0].id;
      } else {
        const result = await service.createMainWallet(keypair);
        mainWalletId = result.walletId;
      }
    });

    it('should create a new ContextWallet', async () => {
      const appId = `test-app-${Date.now()}`;

      const result = await service.createContextWallet(
        {
          mainWalletId,
          appId,
        },
        keypair
      );

      expect(result).toHaveProperty('digest');
      expect(result).toHaveProperty('contextWalletId');
      expect(result.contextWalletId).toMatch(/^0x[a-fA-F0-9]+$/);

      console.log('✅ Created ContextWallet:', result.contextWalletId);
    }, 60000);

    it('should build a ContextWallet creation transaction', () => {
      const tx = service.buildCreateContextWalletTransaction({
        mainWalletId,
        appId: 'test-app',
      });

      expect(tx).toBeDefined();
      // Transaction class is _Transaction in @mysten/sui v4.x
      expect(tx.constructor.name).toMatch(/Transaction/);
    });

    it('should retrieve ContextWallet by object ID', async () => {
      const appId = `test-app-${Date.now()}`;

      // Create a new context wallet first
      const { contextWalletId } = await service.createContextWallet(
        {
          mainWalletId,
          appId,
        },
        keypair
      );

      // Retrieve it
      const contextWallet = await service.getContextWallet(contextWalletId);

      expect(contextWallet).not.toBeNull();
      expect(contextWallet?.id).toBe(contextWalletId);
      expect(contextWallet?.owner).toBe(userAddress);
      expect(contextWallet?.appId).toBe(appId);
      expect(contextWallet?.mainWalletId).toBe(mainWalletId);

      console.log('✅ Retrieved ContextWallet:', {
        id: contextWallet?.id,
        appId: contextWallet?.appId,
        owner: contextWallet?.owner,
      });
    }, 60000);

    it('should get all ContextWallets owned by user', async () => {
      const contextWallets = await service.getContextWalletsByOwner(userAddress);

      expect(contextWallets).toBeInstanceOf(Array);
      expect(contextWallets.length).toBeGreaterThan(0);

      contextWallets.forEach((wallet) => {
        expect(wallet.owner).toBe(userAddress);
        expect(wallet.mainWalletId).toBe(mainWalletId);
      });

      console.log(`✅ Found ${contextWallets.length} ContextWallet(s) for user`);
    }, 60000);

    it('should filter ContextWallets by app ID', async () => {
      const appId = `test-app-${Date.now()}`;

      // Create a context wallet for this app
      await service.createContextWallet(
        {
          mainWalletId,
          appId,
        },
        keypair
      );

      // Query for this specific app
      const contextWallets = await service.getContextWalletsByOwner(userAddress, appId);

      expect(contextWallets).toBeInstanceOf(Array);
      contextWallets.forEach((wallet) => {
        expect(wallet.appId).toBe(appId);
      });

      console.log(`✅ Found ${contextWallets.length} ContextWallet(s) for app: ${appId}`);
    }, 60000);
  });

  describe('Context ID Derivation', () => {
    let mainWallet: any;

    beforeAll(async () => {
      const wallets = await service.getMainWalletsByOwner(userAddress);
      if (wallets.length > 0) {
        mainWallet = wallets[0];
      } else {
        const { walletId } = await service.createMainWallet(keypair);
        mainWallet = await service.getMainWallet(walletId);
      }
    });

    it('should derive context ID locally', () => {
      const appId = 'test-app';

      const contextId = service.deriveContextIdLocal(mainWallet, appId);

      expect(contextId).toMatch(/^0x[a-fA-F0-9]+$/);
      expect(contextId.length).toBeGreaterThan(10);

      console.log('✅ Derived context ID:', contextId);
    });

    it('should derive same context ID for same inputs', () => {
      const appId = 'test-app';

      const contextId1 = service.deriveContextIdLocal(mainWallet, appId);
      const contextId2 = service.deriveContextIdLocal(mainWallet, appId);

      expect(contextId1).toBe(contextId2);

      console.log('✅ Context ID is deterministic');
    });

    it('should derive different context IDs for different apps', () => {
      const appId1 = 'app1';
      const appId2 = 'app2';

      const contextId1 = service.deriveContextIdLocal(mainWallet, appId1);
      const contextId2 = service.deriveContextIdLocal(mainWallet, appId2);

      expect(contextId1).not.toBe(contextId2);

      console.log('✅ Different apps produce different context IDs');
    });

    it('should build transaction to derive context ID on-chain', () => {
      const tx = service.buildDeriveContextIdTransaction(mainWallet.id, 'test-app');

      expect(tx).toBeDefined();
      // Transaction class is _Transaction in @mysten/sui v4.x
      expect(tx.constructor.name).toMatch(/Transaction/);

      console.log('✅ Built derive_context_id transaction');
    });
  });
});
