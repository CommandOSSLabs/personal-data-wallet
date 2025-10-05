const DEFAULT_IMPORTANCE = 5;
export class PdwMemoryService {
    constructor(pdw, appId, geminiAI) {
        this.pdw = pdw;
        this.appId = appId;
        this.geminiAI = geminiAI;
        this.highValueCategories = new Set([
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
    }
    async recordMessage(input) {
        await this.pdw.wallet.ensureMainWallet(input.userAddress).catch((error) => {
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
        const customMetadata = {
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
        const metadata = {
            ...input.metadata,
            sessionId: input.sessionId,
            messageId: input.messageId,
            role: input.role,
            appId: this.appId,
        };
        if (enrichment?.analysis) {
            const existingAnalysis = typeof metadata.analysis === 'object' && metadata.analysis !== null ? metadata.analysis : {};
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
    async getContext(query, userAddress, k = 5) {
        return this.pdw.getMemoryContext(query, userAddress, k);
    }
    async listUserMemories(userAddress) {
        return this.pdw.view.getUserMemories(userAddress);
    }
    async searchMemories(userAddress, query, k = 10) {
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
    async createManualMemory(input) {
        await this.pdw.wallet.ensureMainWallet(input.userAddress).catch((error) => {
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
        const customMetadata = {
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
        const metadata = {
            ...(input.metadata || {}),
            appId: this.appId,
            createdBy: 'pdw-chat-demo',
            topic: input.topic ?? derivedTopic,
            importance: input.importance ?? derivedImportance ?? DEFAULT_IMPORTANCE,
        };
        if (enrichment?.analysis) {
            const existingAnalysis = typeof metadata.analysis === 'object' && metadata.analysis !== null ? metadata.analysis : {};
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
    async enrichContent(params) {
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
        }
        catch (error) {
            console.warn('Failed to analyze memory content for enrichment', error);
            return null;
        }
    }
    normalizeCategorySegment(value) {
        if (!value) {
            return undefined;
        }
        return value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .trim();
    }
    normalizeTopic(value) {
        if (!value) {
            return undefined;
        }
        const normalized = value.replace(/^[^a-z0-9]+/gi, '').trim();
        return normalized.length ? normalized : undefined;
    }
    deriveImportance(analysis, role) {
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
