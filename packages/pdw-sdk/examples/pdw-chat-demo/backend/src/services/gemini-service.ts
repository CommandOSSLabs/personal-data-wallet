import { GoogleGenAI } from '@google/genai';

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessagePayload {
  role: ChatRole;
  content: string;
}

export interface GeminiServiceOptions {
  apiKey: string;
  chatModel: string;
  embeddingModel: string;
}

export interface EmbeddingResult {
  vector: number[];
  model: string;
}

export class GeminiService {
  private readonly client: GoogleGenAI;

  constructor(private readonly options: GeminiServiceOptions) {
    this.client = new GoogleGenAI({ apiKey: options.apiKey });
  }

  async generateAssistantReply(messageHistory: ChatMessagePayload[], context?: string): Promise<string> {
    const contents: Array<{ role: 'user' | 'model' | 'system'; parts: Array<{ text: string }> }> = [];

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

    const text = (response as any)?.text ?? '';

    if (!text) {
      throw new Error('Gemini model returned an empty response');
    }

    return text.trim();
  }

  async embedText(text: string): Promise<EmbeddingResult> {
    const result = await this.client.models.embedContent({
      model: this.options.embeddingModel,
      contents: [
        {
          role: 'user',
          parts: [{ text }],
        },
      ],
    });

    const vector = (result as any)?.embedding?.values as number[] | undefined;
    if (!vector?.length) {
      throw new Error('Failed to generate embeddings');
    }

    return {
      vector,
      model: this.options.embeddingModel,
    };
  }
}

function mapRoleForGemini(role: ChatRole): 'user' | 'model' | 'system' {
  switch (role) {
    case 'assistant':
      return 'model';
    case 'system':
      return 'system';
    default:
      return 'user';
  }
}
