import { GoogleGenAI } from '@google/genai';
export class GeminiService {
    constructor(options) {
        this.options = options;
        this.client = new GoogleGenAI({ apiKey: options.apiKey });
    }
    async generateAssistantReply(messageHistory, context) {
        const contents = [];
        contents.push({
            role: 'system',
            parts: [
                {
                    text: 'You are Personal Data Wallet assistant. Provide concise, helpful answers and reference stored memories when useful.',
                },
            ],
        });
        if (context) {
            contents.push({
                role: 'user',
                parts: [
                    {
                        text: `Relevant context retrieved from the user\'s personal data wallet:\n${context}`,
                    },
                ],
            });
        }
        for (const message of messageHistory) {
            contents.push({
                role: mapRoleForGemini(message.role),
                parts: [{ text: message.content }],
            });
        }
        const response = await this.client.models.generateContent({
            model: this.options.chatModel,
            contents,
        });
        const text = response?.text ?? '';
        if (!text) {
            throw new Error('Gemini model returned an empty response');
        }
        return text.trim();
    }
    async embedText(text) {
        const result = await this.client.models.embedContent({
            model: this.options.embeddingModel,
            contents: [
                {
                    role: 'user',
                    parts: [{ text }],
                },
            ],
        });
        const vector = result?.embedding?.values;
        if (!vector?.length) {
            throw new Error('Failed to generate embeddings');
        }
        return {
            vector,
            model: this.options.embeddingModel,
        };
    }
}
function mapRoleForGemini(role) {
    switch (role) {
        case 'assistant':
            return 'model';
        case 'system':
            return 'system';
        default:
            return 'user';
    }
}
