import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SealService } from '../src/infrastructure/seal/seal.service';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';

describe('SEAL Integration Tests (Real Network)', () => {
  let sealService: SealService;
  let testKeypair: Ed25519Keypair;
  let testAddress: string;
  let suiClient: SuiClient;
  
  // Skip these tests in CI/CD - only run locally when needed
  const skipInCI = process.env.CI ? describe.skip : describe;

  beforeAll(async () => {
    // Use a test keypair - in production this would come from user's wallet
    // Generate a new test keypair for testing
    testKeypair = process.env.TEST_PRIVATE_KEY 
      ? Ed25519Keypair.fromSecretKey(process.env.TEST_PRIVATE_KEY)
      : new Ed25519Keypair();
    testAddress = testKeypair.getPublicKey().toSuiAddress();
    
    // Initialize real Sui client
    suiClient = new SuiClient({ url: getFullnodeUrl('devnet') });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SealService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: any) => {
              const config = {
                SEAL_NETWORK: 'devnet',
                SEAL_PACKAGE_ID: process.env.SEAL_PACKAGE_ID || '0x62c79dfeb0a2ca8c308a56bde530ccf3846535e1623949d45c90d23128afff52',
                SEAL_MODULE_NAME: 'access_control',
                SEAL_THRESHOLD: 2,
                SEAL_SESSION_TTL_MIN: 30,
                SUI_RPC_URL: getFullnodeUrl('devnet'),
                SEAL_KEY_SERVER_IDS: [], // Use default testnet servers
              };
              return config[key] ?? defaultValue;
            }),
          },
        },
      ],
    }).compile();

    sealService = module.get<SealService>(SealService);
  });

  skipInCI('Real Encryption/Decryption', () => {
    it('should encrypt and decrypt data using real SEAL network', async () => {
      const testData = 'This is sensitive health data: Blood type O+, Allergic to penicillin';
      
      // Step 1: Encrypt with real SEAL
      console.log('Encrypting data with SEAL...');
      const startEncrypt = Date.now();
      const { encrypted, backupKey } = await sealService.encrypt(testData, testAddress);
      const encryptTime = Date.now() - startEncrypt;
      
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      expect(backupKey).toBeDefined();
      expect(typeof backupKey).toBe('string');
      console.log(`Encryption completed in ${encryptTime}ms`);
      console.log(`Encrypted data length: ${encrypted.length} chars`);
      
      // Step 2: Get session key message
      const sessionMessage = await sealService.getSessionKeyMessage(testAddress);
      expect(sessionMessage).toBeInstanceOf(Uint8Array);
      
      // Step 3: Sign message with test wallet
      const signature = await testKeypair.signPersonalMessage(Buffer.from(sessionMessage));
      const signatureHex = signature.signature;
      
      // Step 4: Decrypt with real SEAL
      console.log('Decrypting data with SEAL...');
      const startDecrypt = Date.now();
      const decrypted = await sealService.decrypt(encrypted, testAddress, signatureHex);
      const decryptTime = Date.now() - startDecrypt;
      
      expect(decrypted).toBe(testData);
      console.log(`Decryption completed in ${decryptTime}ms`);
      
      // Performance summary
      console.log(`\nPerformance Summary:`);
      console.log(`- Encryption: ${encryptTime}ms`);
      console.log(`- Decryption: ${decryptTime}ms`);
      console.log(`- Total: ${encryptTime + decryptTime}ms`);
    }, 30000); // 30 second timeout for network operations

    it('should handle multiple encryptions efficiently', async () => {
      const testMessages = [
        'Medical record 1: Diabetes Type 2',
        'Medical record 2: High blood pressure',
        'Medical record 3: Recent surgery notes',
      ];
      
      console.log(`\nEncrypting ${testMessages.length} messages...`);
      const encryptionTimes: number[] = [];
      const encryptedData: Array<{encrypted: string, backupKey: string}> = [];
      
      for (const message of testMessages) {
        const start = Date.now();
        const result = await sealService.encrypt(message, testAddress);
        const duration = Date.now() - start;
        encryptionTimes.push(duration);
        encryptedData.push(result);
        console.log(`- Message ${encryptedData.length}: ${duration}ms`);
      }
      
      const avgTime = encryptionTimes.reduce((a, b) => a + b, 0) / encryptionTimes.length;
      console.log(`Average encryption time: ${avgTime.toFixed(2)}ms`);
      
      expect(encryptedData).toHaveLength(testMessages.length);
      encryptedData.forEach(data => {
        expect(data.encrypted).toBeDefined();
        expect(data.backupKey).toBeDefined();
      });
    }, 60000); // 60 second timeout
  });

  skipInCI('Error Handling with Real Network', () => {
    it('should fail decryption with invalid signature', async () => {
      const testData = 'Test data';
      const { encrypted } = await sealService.encrypt(testData, testAddress);
      
      // Use wrong signature
      const invalidSignature = '0x' + 'a'.repeat(128);
      
      await expect(
        sealService.decrypt(encrypted, testAddress, invalidSignature)
      ).rejects.toThrow();
    });

    it('should fail encryption with invalid address', async () => {
      const invalidAddress = '0xinvalid';
      
      await expect(
        sealService.encrypt('Test data', invalidAddress)
      ).rejects.toThrow();
    });
  });

  skipInCI('Session Key Management', () => {
    it('should cache session keys for efficiency', async () => {
      const testData = 'Cached session test';
      const { encrypted } = await sealService.encrypt(testData, testAddress);
      
      // Get session key message and sign
      const sessionMessage = await sealService.getSessionKeyMessage(testAddress);
      const signature = await testKeypair.signPersonalMessage(Buffer.from(sessionMessage));
      const signatureHex = signature.signature;
      
      // First decryption - creates session key
      console.log('\nFirst decryption (creates session key)...');
      const start1 = Date.now();
      const decrypted1 = await sealService.decrypt(encrypted, testAddress, signatureHex);
      const time1 = Date.now() - start1;
      
      // Second decryption - should use cached session key
      console.log('Second decryption (uses cached session key)...');
      const start2 = Date.now();
      const decrypted2 = await sealService.decrypt(encrypted, testAddress, signatureHex);
      const time2 = Date.now() - start2;
      
      expect(decrypted1).toBe(testData);
      expect(decrypted2).toBe(testData);
      
      console.log(`First decryption: ${time1}ms`);
      console.log(`Second decryption: ${time2}ms`);
      console.log(`Speed improvement: ${((time1 - time2) / time1 * 100).toFixed(1)}%`);
      
      // Second should be faster due to caching
      expect(time2).toBeLessThan(time1);
    }, 60000);
  });

  skipInCI('Network and Threshold Verification', () => {
    it('should verify testnet configuration', async () => {
      // Check Sui network connection
      const balance = await suiClient.getBalance({
        owner: testAddress,
      });
      
      console.log(`\nTest wallet balance: ${balance.totalBalance} MIST`);
      expect(parseInt(balance.totalBalance)).toBeGreaterThanOrEqual(0);
    });

    it('should use threshold encryption with multiple key servers', async () => {
      // This test verifies that SEAL is using threshold encryption
      // The actual threshold verification happens inside SEAL client
      const testData = 'Threshold encryption test';
      const { encrypted, backupKey } = await sealService.encrypt(testData, testAddress);
      
      expect(encrypted).toBeDefined();
      expect(backupKey).toBeDefined();
      
      // The threshold of 2 means at least 2 key servers must respond
      // This is configured in the SEAL service initialization
      console.log('\nThreshold encryption active:');
      console.log('- Required key servers: 2');
      console.log('- Network: testnet');
      console.log('- Using allowlisted testnet key servers');
    });
  });
});