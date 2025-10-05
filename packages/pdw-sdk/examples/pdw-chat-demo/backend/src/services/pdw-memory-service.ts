import type { GeminiAIService } from '@personal-data-wallet/sdk/dist/services/GeminiAIService.js';
import type { PdwClient } from './pdw-client.js';

export interface MemoryRecordInput {
  sessionId: string;
  messageId: string;
  userAddress: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  importance?: number;
  topic?: string;
  metadata?: Record<string, unknown>;
}

export interface MemoryRecordResult {
  memoryId: string;
}

export interface ManualMemoryInput {
  userAddress: string;
  content: string;
  category?: string;
  topic?: string;
  importance?: number;
  metadata?: Record<string, unknown>;
  encrypt?: boolean;
}

type ContentAnalysis = {
  categories: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  topics: string[];
  confidence: number;
};

interface MemoryEnrichment {
  categorySegment?: string;
  topic?: string;
  importance?: number;
  analysis?: ContentAnalysis;
}

const DEFAULT_IMPORTANCE = 5;

export class PdwMemoryService {
  private readonly highValueCategories = new Set([
    'personal_info',
    'personal information',
    'contact',
    'career',
    'education',
    'finance',
    'health',
    'relationship',
    'preference',
  ]);

  constructor(
    private readonly pdw: PdwClient,
    private readonly appId?: string,
    private readonly geminiAI?: GeminiAIService,
  ) {}

  async recordMessage(input: MemoryRecordInput): Promise<MemoryRecordResult> {
    await this.pdw.wallet.ensureMainWallet(input.userAddress).catch((error: unknown) => {
      console.warn('Failed to ensure main wallet for user', input.userAddress, error);
    });

    const baseCategory = `chat:${input.sessionId}`;
    const enrichment = await this.enrichContent({
      content: input.content,
      baseCategory,
      role: input.role,
    });

    const category = enrichment?.categorySegment
      ? `${baseCategory}:${enrichment.categorySegment}`
      : baseCategory;

    const derivedTopic = enrichment?.topic;
    const derivedImportance = enrichment?.importance;

    const customMetadata: Record<string, string> = {
      'session-id': input.sessionId,
      'message-id': input.messageId,
      role: input.role,
      'importance-score': String(input.importance ?? derivedImportance ?? DEFAULT_IMPORTANCE),
      'auto-generated': 'true',
    };

    if (this.appId) {
      customMetadata['app-id'] = this.appId;
    }

    if (enrichment?.analysis) {
      const { analysis } = enrichment;
      if (analysis.categories[0]) {
        customMetadata['auto-category'] = analysis.categories[0];
      }
      if (analysis.topics[0]) {
        customMetadata['primary-topic'] = analysis.topics[0];
      }
      customMetadata['analysis-sentiment'] = analysis.sentiment;
      customMetadata['analysis-confidence'] = analysis.confidence.toFixed(2);
    }

    const metadata: Record<string, unknown> = {
      ...input.metadata,
      sessionId: input.sessionId,
      messageId: input.messageId,
      role: input.role,
      appId: this.appId,
    };

    if (enrichment?.analysis) {
      const existingAnalysis =
        typeof metadata.analysis === 'object' && metadata.analysis !== null ? metadata.analysis : {};
      metadata.analysis = {
        ...existingAnalysis,
        ...enrichment.analysis,
        generatedAt: new Date().toISOString(),
      };
    }

    const memoryId = await this.pdw.createMemory({
      content: input.content,
      category,
      userAddress: input.userAddress,
      topic: input.topic ?? derivedTopic,
      importance: input.importance ?? derivedImportance ?? DEFAULT_IMPORTANCE,
      customMetadata,
      metadata,
      encrypt: true,
    });

    return { memoryId };
  }

  async getContext(query: string, userAddress: string, k = 5) {
    return this.pdw.getMemoryContext(query, userAddress, k);
  }

  async listUserMemories(userAddress: string) {
    return this.pdw.view.getUserMemories(userAddress);
  }

  async searchMemories(userAddress: string, query?: string, k = 10) {
    if (query && query.trim().length > 0) {
      return this.pdw.searchMemories({
        query,
        userAddress,
        k,
        includeContent: true,
        threshold: 0.55,
      });
    }

    return this.listUserMemories(userAddress);
  }

  async createManualMemory(input: ManualMemoryInput): Promise<MemoryRecordResult> {
    await this.pdw.wallet.ensureMainWallet(input.userAddress).catch((error: unknown) => {
      console.warn('Failed to ensure main wallet for user', input.userAddress, error);
    });

    const baseCategory = input.category?.trim() || 'manual-entry';
    const enrichment = await this.enrichContent({
      content: input.content,
      baseCategory,
      role: 'user',
    });

    const category = enrichment?.categorySegment
      ? `${baseCategory}:${enrichment.categorySegment}`
      : baseCategory;

    const derivedTopic = enrichment?.topic;
    const derivedImportance = enrichment?.importance;

    const customMetadata: Record<string, string> = {
      'entry-type': 'manual',
      category,
      'auto-generated': 'true',
      'importance-score': String(input.importance ?? derivedImportance ?? DEFAULT_IMPORTANCE),
    };

    if (this.appId) {
      customMetadata['app-id'] = this.appId;
    }

    if (enrichment?.analysis) {
      const { analysis } = enrichment;
      if (analysis.categories[0]) {
        customMetadata['auto-category'] = analysis.categories[0];
      }
      if (analysis.topics[0]) {
        customMetadata['primary-topic'] = analysis.topics[0];
      }
      customMetadata['analysis-sentiment'] = analysis.sentiment;
      customMetadata['analysis-confidence'] = analysis.confidence.toFixed(2);
    }

    const metadata: Record<string, unknown> = {
      ...(input.metadata || {}),
      appId: this.appId,
      createdBy: 'pdw-chat-demo',
      topic: input.topic ?? derivedTopic,
      importance: input.importance ?? derivedImportance ?? DEFAULT_IMPORTANCE,
    };

    if (enrichment?.analysis) {
      const existingAnalysis =
        typeof metadata.analysis === 'object' && metadata.analysis !== null ? metadata.analysis : {};
      metadata.analysis = {
        ...existingAnalysis,
        ...enrichment.analysis,
        generatedAt: new Date().toISOString(),
      };
    }

    const memoryId = await this.pdw.createMemory({
      content: input.content,
      category,
      userAddress: input.userAddress,
      topic: input.topic ?? derivedTopic,
      importance: input.importance ?? derivedImportance ?? DEFAULT_IMPORTANCE,
      customMetadata,
      metadata,
      encrypt: true,
    });

    return { memoryId };
  }

  private async enrichContent(params: {
    content: string;
    baseCategory: string;
    role: MemoryRecordInput['role'];
  }): Promise<MemoryEnrichment | null> {
    if (!this.geminiAI) {
      return null;
    }

    try {
      const analysis = await this.geminiAI.analyzeContent(params.content);
      const categorySegment = this.normalizeCategorySegment(analysis.categories[0]);
      const topic = this.normalizeTopic(analysis.topics[0]);
      const importance = this.deriveImportance(analysis, params.role);

      return {
        categorySegment,
        topic,
        importance,
        analysis,
      };
    } catch (error) {
      console.warn('Failed to analyze memory content for enrichment', error);
      return null;
    }
  }

  private normalizeCategorySegment(value?: string): string | undefined {
    if (!value) {
      return undefined;
    }

    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .trim();
  }

  private normalizeTopic(value?: string): string | undefined {
    if (!value) {
      return undefined;
    }

    const normalized = value.replace(/^[^a-z0-9]+/gi, '').trim();
    return normalized.length ? normalized : undefined;
  }

  private deriveImportance(analysis: ContentAnalysis, role: MemoryRecordInput['role']): number {
    const baseFromConfidence = analysis.confidence && analysis.confidence > 0
      ? Math.round(Math.min(10, Math.max(1, analysis.confidence * 10)))
      : DEFAULT_IMPORTANCE;

    let score = baseFromConfidence;

    if (analysis.sentiment !== 'neutral') {
      score += 1;
    }

    if (analysis.categories.some((category) => this.highValueCategories.has(category.toLowerCase()))) {
      score += 2;
    }

    if (role === 'assistant') {
      score = Math.max(score - 1, 1);
    }

    return Math.min(10, Math.max(1, score));
  }
}
