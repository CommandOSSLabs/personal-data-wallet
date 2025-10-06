import 'reflect-metadata';
import cors from 'cors';
import express, { Request, Response } from 'express';
import { z } from 'zod';
import { GeminiAIService as PdwGeminiAIService } from 'personal-data-wallet-sdk/dist/services/GeminiAIService.js';
import { loadConfig } from './config/env.js';
import { ensureDatabaseConnection } from './db/data-source.js';
import { createChatRouter } from './routes/chat-routes.js';
import { createConsentRouter } from './routes/consent-routes.js';
import { ChatService } from './services/chat-service.js';
import { GeminiService } from './services/gemini-service.js';
import { createPdwClient } from './services/pdw-client.js';
import { PdwMemoryService } from './services/pdw-memory-service.js';
import { getConsentRepository } from './services/consent-repository.js';

async function bootstrap() {
  const config = loadConfig();
  const dataSource = await ensureDatabaseConnection(config);
  const consentRepository = getConsentRepository(config);
  const pdw = await createPdwClient(config, { consentRepository });

  const geminiAI = new PdwGeminiAIService({
    apiKey: config.geminiApiKey,
    model: config.geminiModel,
  });
  const memoryService = new PdwMemoryService(pdw, config.pdwContextAppId, geminiAI);
  const geminiService = new GeminiService({
    apiKey: config.geminiApiKey,
    chatModel: config.geminiModel,
    embeddingModel: config.geminiEmbeddingModel,
  });
  const chatService = new ChatService(dataSource, geminiService, memoryService);

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/health', async (_req: Request, res: Response) => {
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      nodeEnv: config.nodeEnv,
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      services: {
        database: 'unknown',
        pdw: 'unknown',
        gemini: 'unknown',
        walrus: 'unknown'
      }
    };

    try {
      // Check database connection
      try {
        await dataSource.query('SELECT 1');
        healthCheck.services.database = 'connected';
      } catch (error) {
        healthCheck.services.database = 'error';
        healthCheck.status = 'degraded';
      }

      // Check PDW client
      try {
        // Simple check - just verify client is initialized
        if (pdw) {
          healthCheck.services.pdw = 'initialized';
        }
      } catch (error) {
        healthCheck.services.pdw = 'error';
        healthCheck.status = 'degraded';
      }

      // Check Gemini service
      try {
        if (geminiAI && config.geminiApiKey) {
          healthCheck.services.gemini = 'configured';
        } else {
          healthCheck.services.gemini = 'not_configured';
        }
      } catch (error) {
        healthCheck.services.gemini = 'error';
        healthCheck.status = 'degraded';
      }

      // Check Walrus service
      try {
        if (config.walrusUploadRelay) {
          healthCheck.services.walrus = 'configured';
        } else {
          healthCheck.services.walrus = 'not_configured';
        }
      } catch (error) {
        healthCheck.services.walrus = 'error';
        healthCheck.status = 'degraded';
      }

      const statusCode = healthCheck.status === 'healthy' ? 200 : 503;
      res.status(statusCode).json(healthCheck);

    } catch (error) {
      console.error('Health check failed:', error);
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        services: healthCheck.services
      });
    }
  });

  app.get('/pdw/memories', async (req: Request, res: Response) => {
    const userAddress = (req.query.userAddress ?? req.query.user) as string | undefined;
    if (!userAddress) {
      return res.status(400).json({ error: 'userAddress query parameter is required' });
    }

    const query = typeof req.query.query === 'string' ? req.query.query : typeof req.query.q === 'string' ? req.query.q : undefined;
    const kParam = typeof req.query.k === 'string' ? Number.parseInt(req.query.k, 10) : undefined;
    const k = Number.isInteger(kParam) && kParam ? kParam : undefined;

    try {
      const memories = await memoryService.searchMemories(userAddress, query, k);
      res.json({ memories });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unable to load PDW memories';
      res.status(500).json({ error: message });
    }
  });

  const createMemorySchema = z.object({
    userAddress: z.string().min(1, 'userAddress is required'),
    content: z.string().min(1, 'content is required'),
    category: z.string().optional(),
    topic: z.string().optional(),
    importance: z.coerce.number().min(0).max(10).optional(),
    metadata: z.record(z.any()).optional(),
    encrypt: z.boolean().optional(),
  });

  app.post('/pdw/memories', async (req: Request, res: Response) => {
    const parseResult = createMemorySchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.flatten() });
    }

    try {
      const { memoryId } = await memoryService.createManualMemory(parseResult.data);
      res.status(201).json({ memoryId });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unable to create PDW memory';
      res.status(500).json({ error: message });
    }
  });

  app.use('/chat', createChatRouter(chatService));
  app.use('/pdw/consents', createConsentRouter(pdw, consentRepository));

  app.listen(config.port, '0.0.0.0', () => {
    console.log(`PDW chat backend listening on http://0.0.0.0:${config.port}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start backend server', error);
  process.exit(1);
});
