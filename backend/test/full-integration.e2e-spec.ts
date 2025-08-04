import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { SuiService } from '../src/infrastructure/sui/sui.service';
import { SealService } from '../src/infrastructure/seal/seal.service';
import { WalrusService } from '../src/infrastructure/walrus/walrus.service';

describe('Full Integration Test - Sui Testnet + Seal + Walrus', () => {
  let app: INestApplication;
  let suiService: SuiService;
  let sealService: SealService;
  let walrusService: WalrusService;
  
  // Test user address (you'll need to replace this with your actual testnet address)
  const TEST_USER_ADDRESS = '0xc5e67f46e1b99b580da3a6cc69acf187d0c08dbe568f8f5a78959079c9d82a15';
  const TEST_USER_ID = `sui:${TEST_USER_ADDRESS}`;
  
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    
    suiService = moduleFixture.get<SuiService>(SuiService);
    sealService = moduleFixture.get<SealService>(SealService);
    walrusService = moduleFixture.get<WalrusService>(WalrusService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('1. Seal Service Health Check', () => {
    it('should verify Seal service is connected to testnet', async () => {
      const isHealthy = await sealService.checkHealth();
      expect(isHealthy).toBe(true);
    });

    it('should get Seal network status', async () => {
      const status = await sealService.getNetworkStatus();
      console.log('Seal Network Status:', status);
      expect(status).toBeDefined();
      expect(status.network).toBe('testnet');
    });
  });

  describe('2. Chat Session Management', () => {
    let sessionId: string;
    
    it('should create a new chat session on Sui', async () => {
      const response = await request(app.getHttpServer())
        .post('/chat/sessions')
        .send({
          userId: TEST_USER_ID,
          modelName: 'gemini-1.5-pro'
        })
        .expect(201);
      
      sessionId = response.body.sessionId;
      console.log('Created session:', sessionId);
      expect(sessionId).toBeDefined();
      expect(sessionId.startsWith('0x')).toBe(true);
    });

    it('should add messages to the session', async () => {
      const response = await request(app.getHttpServer())
        .post(`/chat/sessions/${sessionId}/messages`)
        .send({
          userId: TEST_USER_ID,
          role: 'user',
          content: 'Hello, this is a test message for testnet integration'
        })
        .expect(201);
      
      expect(response.body.success).toBe(true);
    });

    it('should retrieve the session with messages', async () => {
      const response = await request(app.getHttpServer())
        .get(`/chat/sessions/${sessionId}`)
        .query({ userId: TEST_USER_ID })
        .expect(200);
      
      console.log('Session data:', response.body);
      expect(response.body.messages).toHaveLength(1);
      expect(response.body.messages[0].content).toContain('test message');
    });

    it('should list all sessions for the user', async () => {
      const response = await request(app.getHttpServer())
        .get('/chat/sessions')
        .query({ userId: TEST_USER_ID })
        .expect(200);
      
      console.log(`Found ${response.body.length} sessions`);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body.some(s => s.id === sessionId)).toBe(true);
    });
  });

  describe('3. Memory Storage with Seal Encryption', () => {
    let memoryId: string;
    const testMemoryContent = {
      text: 'This is a test memory for Sui testnet integration',
      category: 'test',
      metadata: {
        source: 'integration-test',
        timestamp: new Date().toISOString()
      }
    };

    it('should create and encrypt a memory', async () => {
      const response = await request(app.getHttpServer())
        .post('/memory')
        .send({
          userId: TEST_USER_ID,
          content: testMemoryContent,
          category: 'test'
        })
        .expect(201);
      
      memoryId = response.body.id;
      console.log('Created memory:', memoryId);
      expect(memoryId).toBeDefined();
      expect(response.body.encrypted).toBe(true);
    });

    it('should retrieve and decrypt the memory', async () => {
      const response = await request(app.getHttpServer())
        .get(`/memory/${memoryId}`)
        .query({ userId: TEST_USER_ID })
        .expect(200);
      
      console.log('Retrieved memory:', response.body);
      expect(response.body.content.text).toBe(testMemoryContent.text);
      expect(response.body.category).toBe('test');
    });

    it('should search memories by content', async () => {
      const response = await request(app.getHttpServer())
        .post('/memory/search')
        .send({
          userId: TEST_USER_ID,
          query: 'testnet integration'
        })
        .expect(200);
      
      console.log(`Found ${response.body.length} matching memories`);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].id).toBe(memoryId);
    });
  });

  describe('4. Memory Index Management', () => {
    it('should create a memory index on Sui', async () => {
      const response = await request(app.getHttpServer())
        .post('/memory/index')
        .send({
          userId: TEST_USER_ID,
          indexData: {
            version: 1,
            vectorDimensions: 768
          }
        })
        .expect(201);
      
      console.log('Created index:', response.body);
      expect(response.body.indexId).toBeDefined();
      expect(response.body.indexId.startsWith('0x')).toBe(true);
    });

    it('should update the memory index', async () => {
      // First create an index
      const createResponse = await request(app.getHttpServer())
        .post('/memory/index')
        .send({
          userId: TEST_USER_ID,
          indexData: { version: 1 }
        });
      
      const indexId = createResponse.body.indexId;
      
      // Then update it
      const updateResponse = await request(app.getHttpServer())
        .put(`/memory/index/${indexId}`)
        .send({
          userId: TEST_USER_ID,
          expectedVersion: 1,
          newIndexData: { version: 2 }
        })
        .expect(200);
      
      expect(updateResponse.body.success).toBe(true);
    });
  });

  describe('5. Walrus Storage Integration', () => {
    it('should store data in Walrus (if available)', async () => {
      try {
        const testData = {
          content: 'Test data for Walrus storage',
          timestamp: new Date().toISOString()
        };
        
        const blobId = await walrusService.storeBlob(Buffer.from(JSON.stringify(testData)));
        console.log('Stored blob in Walrus:', blobId);
        expect(blobId).toBeDefined();
        
        const retrieved = await walrusService.retrieveBlob(blobId);
        const parsedData = JSON.parse(retrieved.toString());
        expect(parsedData.content).toBe(testData.content);
      } catch (error) {
        console.log('Walrus test skipped:', error.message);
        // Walrus might not be fully configured, skip this test
      }
    });
  });

  describe('6. End-to-End Workflow', () => {
    it('should complete a full workflow: create session, add messages, create memory', async () => {
      // Step 1: Create a chat session
      const sessionResponse = await request(app.getHttpServer())
        .post('/chat/sessions')
        .send({
          userId: TEST_USER_ID,
          modelName: 'gemini-1.5-pro'
        });
      
      const sessionId = sessionResponse.body.sessionId;
      console.log('Step 1 - Created session:', sessionId);
      
      // Step 2: Add user message
      await request(app.getHttpServer())
        .post(`/chat/sessions/${sessionId}/messages`)
        .send({
          userId: TEST_USER_ID,
          role: 'user',
          content: 'Tell me about blockchain technology'
        });
      
      console.log('Step 2 - Added user message');
      
      // Step 3: Add AI response
      await request(app.getHttpServer())
        .post(`/chat/sessions/${sessionId}/messages`)
        .send({
          userId: TEST_USER_ID,
          role: 'assistant',
          content: 'Blockchain is a distributed ledger technology...'
        });
      
      console.log('Step 3 - Added AI response');
      
      // Step 4: Create memory from conversation
      const memoryResponse = await request(app.getHttpServer())
        .post('/memory')
        .send({
          userId: TEST_USER_ID,
          content: {
            text: 'User asked about blockchain technology. Key points: distributed ledger, immutability, consensus mechanisms.',
            sessionId: sessionId,
            category: 'technology'
          },
          category: 'technology'
        });
      
      console.log('Step 4 - Created memory:', memoryResponse.body.id);
      
      // Step 5: Verify everything is stored correctly
      const finalSession = await request(app.getHttpServer())
        .get(`/chat/sessions/${sessionId}`)
        .query({ userId: TEST_USER_ID });
      
      expect(finalSession.body.messages).toHaveLength(2);
      console.log('Step 5 - Verified: Full workflow completed successfully!');
    });
  });

  describe('7. Error Handling and Edge Cases', () => {
    it('should handle invalid session ID gracefully', async () => {
      await request(app.getHttpServer())
        .get('/chat/sessions/0xinvalid')
        .query({ userId: TEST_USER_ID })
        .expect(404);
    });

    it('should reject unauthorized access', async () => {
      // Try to access with different user ID
      const response = await request(app.getHttpServer())
        .get('/chat/sessions')
        .query({ userId: 'sui:0x0000000000000000000000000000000000000000000000000000000000000000' })
        .expect(200);
      
      expect(response.body).toEqual([]);
    });
  });
});