import type { Request, Response } from 'express';
import { Router } from 'express';
import { z } from 'zod';
import type { ChatService } from '../services/chat-service.js';

const createSessionSchema = z.object({
  title: z.string().min(1),
  userAddress: z.string().min(1),
  metadata: z.record(z.any()).optional(),
});

const sendMessageSchema = z.object({
  content: z.string().min(1),
  userAddress: z.string().min(1),
});

const userQuerySchema = z.object({
  userAddress: z.string().min(1),
});

export function createChatRouter(chatService: ChatService) {
  const router = Router();

  router.get('/sessions', async (req: Request, res: Response) => {
    const parseResult = userQuerySchema.safeParse({
      userAddress: req.query.userAddress ?? req.query.user,
    });

    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.flatten() });
    }

    const sessions = await chatService.listSessions(parseResult.data.userAddress);
    res.json({ sessions });
  });

  router.post('/sessions', async (req: Request, res: Response) => {
    const parseResult = createSessionSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.flatten() });
    }

    try {
      const session = await chatService.createSession(parseResult.data);
      res.status(201).json({ session });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'failed to create session';
      res.status(500).json({ error: message });
    }
  });

  router.get('/sessions/:sessionId', async (req: Request, res: Response) => {
    const parseResult = userQuerySchema.safeParse({
      userAddress: req.query.userAddress ?? req.query.user,
    });

    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.flatten() });
    }

    try {
      const session = await chatService.getSession(req.params.sessionId, parseResult.data.userAddress);
      if (!session) {
        return res.status(404).json({ error: 'session not found' });
      }

      const messages = await chatService.getSessionMessages(req.params.sessionId, parseResult.data.userAddress);
      res.json({ session, messages });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'failed to load session';
      res.status(500).json({ error: message });
    }
  });

  router.get('/sessions/:sessionId/messages', async (req: Request, res: Response) => {
    const parseResult = userQuerySchema.safeParse({
      userAddress: req.query.userAddress ?? req.query.user,
    });

    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.flatten() });
    }

    try {
  const messages = await chatService.getSessionMessages(req.params.sessionId, parseResult.data.userAddress);
      res.json({ messages });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'failed to load messages';
      res.status(500).json({ error: message });
    }
  });

  router.post('/sessions/:sessionId/messages', async (req: Request, res: Response) => {
    const parseResult = sendMessageSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.flatten() });
    }

    try {
      const responsePayload = await chatService.sendMessage({
        sessionId: req.params.sessionId,
        userAddress: parseResult.data.userAddress,
        content: parseResult.data.content,
      });

      res.status(201).json(responsePayload);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'failed to send message';
      res.status(500).json({ error: message });
    }
  });

  return router;
}
