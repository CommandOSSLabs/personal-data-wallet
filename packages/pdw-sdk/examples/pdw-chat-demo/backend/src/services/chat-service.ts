import { DataSource } from 'typeorm';
import { ChatSession } from '../entities/ChatSession.js';
import { ChatMessage } from '../entities/ChatMessage.js';
import { GeminiService, type ChatMessagePayload } from './gemini-service.js';
import { PdwMemoryService } from './pdw-memory-service.js';

export interface CreateSessionInput {
  title: string;
  userAddress: string;
  metadata?: Record<string, unknown>;
}

export interface SendMessageInput {
  sessionId: string;
  userAddress: string;
  content: string;
}

export interface ChatResponse {
  session: ChatSession;
  messages: ChatMessage[];
  contextSummary?: string;
}

export class ChatService {
  private readonly sessionRepo;
  private readonly messageRepo;

  constructor(
    private readonly dataSource: DataSource,
    private readonly geminiService: GeminiService,
    private readonly memoryService: PdwMemoryService
  ) {
    this.sessionRepo = this.dataSource.getRepository(ChatSession);
    this.messageRepo = this.dataSource.getRepository(ChatMessage);
  }

  async createSession(input: CreateSessionInput): Promise<ChatSession> {
    const session = this.sessionRepo.create({
      title: input.title,
      userAddress: input.userAddress,
      archived: false,
      metadata: input.metadata,
    });

    return this.sessionRepo.save(session);
  }

  async listSessions(userAddress: string): Promise<ChatSession[]> {
    return this.sessionRepo.find({
      where: { userAddress },
      order: { updatedAt: 'DESC', createdAt: 'DESC' },
    });
  }

  async getSession(sessionId: string, userAddress: string): Promise<ChatSession | null> {
    return this.sessionRepo.findOne({
      where: { id: sessionId, userAddress },
    });
  }

  async getSessionMessages(sessionId: string, userAddress: string): Promise<ChatMessage[]> {
    const session = await this.getSession(sessionId, userAddress);
    if (!session) {
      throw new Error('Session not found for user');
    }

    return this.messageRepo.find({
      where: { sessionId: session.id },
      order: { createdAt: 'ASC' },
    });
  }

  async sendMessage(input: SendMessageInput): Promise<ChatResponse> {
    const session = await this.sessionRepo.findOne({
      where: { id: input.sessionId, userAddress: input.userAddress },
    });

    if (!session) {
      throw new Error('Session not found for user');
    }

    const userMessage = this.messageRepo.create({
      role: 'user',
      content: input.content,
      sessionId: session.id,
      session,
    });

    const savedUserMessage = await this.messageRepo.save(userMessage);

    try {
      const memoryResult = await this.memoryService.recordMessage({
        sessionId: session.id,
        messageId: savedUserMessage.id,
        userAddress: session.userAddress,
        role: 'user',
        content: input.content,
      });

      savedUserMessage.metadata = {
        ...(savedUserMessage.metadata || {}),
        pdwMemoryId: memoryResult.memoryId,
      };

      await this.messageRepo.save(savedUserMessage);
    } catch (error) {
      console.warn('Failed to persist user message to PDW', error);
    }

    const history = await this.getSessionMessages(session.id, session.userAddress);

    const context = await this.memoryService.getContext(input.content, session.userAddress).catch((error) => {
      console.warn('Failed to fetch memory context', error);
      return null;
    });

    const chatHistory: ChatMessagePayload[] = history.map((message: ChatMessage) => ({
      role: message.role,
      content: message.content,
    }));

    const assistantReply = await this.geminiService.generateAssistantReply(chatHistory, context?.context).catch((error) => {
      console.error('Gemini response failed', error);
      return 'I ran into an issue while generating a response. Please try again later.';
    });

    const assistantMessage = this.messageRepo.create({
      role: 'assistant',
      content: assistantReply,
      sessionId: session.id,
      session,
      metadata: context ? { contextMetadata: context.queryMetadata } : undefined,
    });

    const savedAssistantMessage = await this.messageRepo.save(assistantMessage);

    try {
      const memoryResult = await this.memoryService.recordMessage({
        sessionId: session.id,
        messageId: savedAssistantMessage.id,
        userAddress: session.userAddress,
        role: 'assistant',
        content: assistantReply,
      });

      savedAssistantMessage.metadata = {
        ...(savedAssistantMessage.metadata || {}),
        pdwMemoryId: memoryResult.memoryId,
      };

      await this.messageRepo.save(savedAssistantMessage);
    } catch (error) {
      console.warn('Failed to persist assistant message to PDW', error);
    }

    const updatedAt = savedAssistantMessage.createdAt instanceof Date
      ? savedAssistantMessage.createdAt
      : new Date(savedAssistantMessage.createdAt);
    session.updatedAt = updatedAt;
    await this.sessionRepo.save(session);

    const updatedSession = await this.getSession(session.id, session.userAddress);
    const messages = await this.getSessionMessages(session.id, session.userAddress);

    return {
      session: updatedSession ?? session,
      messages,
      contextSummary: context?.context,
    };
  }
}
