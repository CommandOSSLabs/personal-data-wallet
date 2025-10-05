import 'reflect-metadata';
import cors from 'cors';
import express from 'express';
import { z } from 'zod';
import { GeminiAIService as PdwGeminiAIService } from '@personal-data-wallet/sdk/dist/services/GeminiAIService.js';
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
    app.get('/health', (_req, res) => {
        res.json({
            status: 'ok',
            pdwConnected: true,
            nodeEnv: config.nodeEnv,
        });
    });
    app.get('/pdw/memories', async (req, res) => {
        const userAddress = (req.query.userAddress ?? req.query.user);
        if (!userAddress) {
            return res.status(400).json({ error: 'userAddress query parameter is required' });
        }
        const query = typeof req.query.query === 'string' ? req.query.query : typeof req.query.q === 'string' ? req.query.q : undefined;
        const kParam = typeof req.query.k === 'string' ? Number.parseInt(req.query.k, 10) : undefined;
        const k = Number.isInteger(kParam) && kParam ? kParam : undefined;
        try {
            const memories = await memoryService.searchMemories(userAddress, query, k);
            res.json({ memories });
        }
        catch (error) {
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
    app.post('/pdw/memories', async (req, res) => {
        const parseResult = createMemorySchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: parseResult.error.flatten() });
        }
        try {
            const { memoryId } = await memoryService.createManualMemory(parseResult.data);
            res.status(201).json({ memoryId });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'unable to create PDW memory';
            res.status(500).json({ error: message });
        }
    });
    app.use('/chat', createChatRouter(chatService));
    app.use('/pdw/consents', createConsentRouter(pdw, consentRepository));
    app.listen(config.port, () => {
        console.log(`PDW chat backend listening on http://localhost:${config.port}`);
    });
}
bootstrap().catch((error) => {
    console.error('Failed to start backend server', error);
    process.exit(1);
});
