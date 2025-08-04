import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SealService } from './seal.service';
import { SealClient, SessionKey, getAllowlistedKeyServers } from '@mysten/seal';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

// Mock the external dependencies
jest.mock('@mysten/seal');
jest.mock('@mysten/sui/client');
jest.mock('@mysten/sui/transactions');

describe('SealService', () => {
  let service: SealService;
  let configService: ConfigService;
  let mockSealClient: jest.Mocked<SealClient>;
  let mockSuiClient: jest.Mocked<SuiClient>;

  beforeEach(async () => {
    // Create mock instances
    mockSealClient = {
      encrypt: jest.fn(),
      decrypt: jest.fn(),
      fetchKeys: jest.fn(),
    } as any;

    mockSuiClient = {
      // Add any required SuiClient methods here
    } as any;

    // Mock the constructors
    (SealClient as jest.MockedClass<typeof SealClient>).mockImplementation(() => mockSealClient);
    (SuiClient as jest.MockedClass<typeof SuiClient>).mockImplementation(() => mockSuiClient);
    (getAllowlistedKeyServers as jest.Mock).mockReturnValue(['0xserver1', '0xserver2']);
    
    // Mock Transaction
    const mockTransaction = {
      moveCall: jest.fn(),
      build: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4, 5])),
      pure: {
        vector: jest.fn().mockReturnValue([]),
      },
    };
    (Transaction as jest.MockedClass<typeof Transaction>).mockImplementation(() => mockTransaction as any);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SealService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: any) => {
              const config = {
                SEAL_NETWORK: 'testnet',
                SEAL_PACKAGE_ID: '0x1234567890abcdef',
                SEAL_MODULE_NAME: 'access_control',
                SEAL_THRESHOLD: 2,
                SEAL_SESSION_TTL_MIN: 60,
                SUI_RPC_URL: 'https://fullnode.testnet.sui.io:443',
                SEAL_KEY_SERVER_IDS: [],
              };
              return config[key] ?? defaultValue;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<SealService>(SealService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('encrypt', () => {
    it('should encrypt content successfully', async () => {
      const content = 'Hello, World!';
      const userAddress = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const mockEncryptedObject = new Uint8Array([1, 2, 3, 4, 5]);
      const mockBackupKey = new Uint8Array([6, 7, 8, 9, 10]);

      mockSealClient.encrypt.mockResolvedValue({
        encryptedObject: mockEncryptedObject,
        key: mockBackupKey,
      });

      const result = await service.encrypt(content, userAddress);

      expect(result).toHaveProperty('encrypted');
      expect(result).toHaveProperty('backupKey');
      expect(typeof result.encrypted).toBe('string'); // base64
      expect(typeof result.backupKey).toBe('string'); // hex
      expect(mockSealClient.encrypt).toHaveBeenCalledWith(
        expect.objectContaining({
          threshold: 2,
          data: expect.any(Uint8Array),
        })
      );
    });

    it('should handle encryption errors', async () => {
      const content = 'Hello, World!';
      const userAddress = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

      mockSealClient.encrypt.mockRejectedValue(new Error('Network error'));

      await expect(service.encrypt(content, userAddress)).rejects.toThrow('SEAL encryption error: Network error');
    });
  });

  describe('decrypt', () => {
    it('should throw error when signature is not provided', async () => {
      const encryptedContent = Buffer.from([1, 2, 3, 4, 5]).toString('base64');
      const userAddress = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

      await expect(service.decrypt(encryptedContent, userAddress)).rejects.toThrow(
        'User signature required for session key initialization'
      );
    });

    it('should decrypt content successfully with signature', async () => {
      const content = 'Hello, World!';
      const encryptedContent = Buffer.from([1, 2, 3, 4, 5]).toString('base64');
      const userAddress = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const signature = '0xsignature123';
      const mockDecryptedBytes = new TextEncoder().encode(content);

      // Mock SessionKey
      const mockSessionKey = {
        setPersonalMessageSignature: jest.fn(),
      } as any;
      
      (SessionKey as jest.MockedClass<typeof SessionKey>).mockImplementation(() => mockSessionKey);

      mockSealClient.decrypt.mockResolvedValue(mockDecryptedBytes);

      const result = await service.decrypt(encryptedContent, userAddress, signature);

      expect(result).toBe(content);
      expect(mockSealClient.decrypt).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.any(Uint8Array),
          sessionKey: expect.any(Object),
          txBytes: expect.any(Uint8Array),
        })
      );
    });

    it('should handle decryption errors', async () => {
      const encryptedContent = Buffer.from([1, 2, 3, 4, 5]).toString('base64');
      const userAddress = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const signature = '0xsignature123';

      // Mock SessionKey
      const mockSessionKey = {
        setPersonalMessageSignature: jest.fn(),
      } as any;
      
      (SessionKey as jest.MockedClass<typeof SessionKey>).mockImplementation(() => mockSessionKey);

      mockSealClient.decrypt.mockRejectedValue(new Error('Invalid ciphertext'));

      await expect(service.decrypt(encryptedContent, userAddress, signature)).rejects.toThrow(
        'SEAL decryption error: Invalid ciphertext'
      );
    });
  });

  describe('getSessionKeyMessage', () => {
    it('should return a session key message', async () => {
      const userAddress = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const mockMessage = new Uint8Array([1, 2, 3, 4, 5]);

      const mockSessionKey = {
        getPersonalMessage: jest.fn().mockReturnValue(mockMessage),
      } as any;
      
      (SessionKey as jest.MockedClass<typeof SessionKey>).mockImplementation(() => mockSessionKey);

      const result = await service.getSessionKeyMessage(userAddress);

      expect(result).toBe(mockMessage);
    });
  });

  describe('fetchMultipleKeys', () => {
    it('should fetch multiple keys successfully', async () => {
      const ids = ['0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'];
      const userAddress = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const signature = '0xsignature123';
      const mockKeys = [new Uint8Array([1, 2, 3]), new Uint8Array([4, 5, 6])];

      // Mock SessionKey
      const mockSessionKey = {
        setPersonalMessageSignature: jest.fn(),
      } as any;
      
      (SessionKey as jest.MockedClass<typeof SessionKey>).mockImplementation(() => mockSessionKey);

      mockSealClient.fetchKeys.mockResolvedValue(mockKeys);

      const result = await service.fetchMultipleKeys(ids, userAddress, signature);

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(2);
      expect(result.get(ids[0])).toBe(mockKeys[0]);
      expect(result.get(ids[1])).toBe(mockKeys[1]);
    });

    it('should handle batch fetch errors', async () => {
      const ids = ['0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'];
      const userAddress = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const signature = '0xsignature123';

      // Mock SessionKey
      const mockSessionKey = {
        setPersonalMessageSignature: jest.fn(),
      } as any;
      
      (SessionKey as jest.MockedClass<typeof SessionKey>).mockImplementation(() => mockSessionKey);

      mockSealClient.fetchKeys.mockRejectedValue(new Error('Network timeout'));

      await expect(service.fetchMultipleKeys(ids, userAddress, signature)).rejects.toThrow(
        'SEAL batch fetch error: Network timeout'
      );
    });
  });

  describe('decryptWithBackupKey', () => {
    it('should throw not implemented error', async () => {
      const encryptedContent = 'encrypted';
      const backupKey = 'backupkey';

      await expect(service.decryptWithBackupKey(encryptedContent, backupKey)).rejects.toThrow(
        'Backup key decryption error: Backup key decryption not yet implemented'
      );
    });
  });
});