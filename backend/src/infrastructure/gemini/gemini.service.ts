import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable, Subject } from 'rxjs';
import { 
  GoogleGenerativeAI,
  GenerativeModel,
  GenerationConfig,
  Content
} from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private generativeAI: GoogleGenerativeAI;
  private logger = new Logger(GeminiService.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GOOGLE_API_KEY');
    if (!apiKey) {
      this.logger.error('GOOGLE_API_KEY not provided');
      throw new Error('GOOGLE_API_KEY not provided');
    }
    this.generativeAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Generate content using Gemini model (non-streaming)
   */
  async generateContent(
    modelName: string = 'gemini-1.5-pro',
    history: { role: string; content: string }[] = [],
    systemPrompt?: string
  ): Promise<string> {
    try {
      const model = this.getModel(modelName);
      
      // Format the chat history
      const formattedHistory = this.formatChatHistory(history);
      
      // Add system prompt if provided
      const parts = formattedHistory.slice();
      if (systemPrompt) {
        parts.unshift({
          role: 'system',
          parts: [{ text: systemPrompt }]
        });
      }
      
      const result = await model.generateContent({
        contents: parts,
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 2048,
        },
      });
      
      return result.response.text();
    } catch (error) {
      this.logger.error(`Error generating content: ${error.message}`);
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  /**
   * Generate content stream using Gemini model
   */
  generateContentStream(
    modelName: string = 'gemini-1.5-pro',
    history: { role: string; content: string }[] = [],
    systemPrompt?: string
  ): Observable<string> {
    const subject = new Subject<string>();
    
    (async () => {
      try {
        const model = this.getModel(modelName);
        
        // Format the chat history
        const formattedHistory = this.formatChatHistory(history);
        
        // Add system prompt if provided
        const parts = formattedHistory.slice();
        if (systemPrompt) {
          parts.unshift({
            role: 'system',
            parts: [{ text: systemPrompt }]
          });
        }
        
        const result = await model.generateContentStream({
          contents: parts,
          generationConfig: {
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 2048,
          },
        });
        
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          subject.next(chunkText);
        }
        
        subject.complete();
      } catch (error) {
        this.logger.error(`Error streaming content: ${error.message}`);
        subject.error(new Error(`Gemini API error: ${error.message}`));
      }
    })();
    
    return subject.asObservable();
  }

  /**
   * Embed text into vector representation
   */
  async embedText(
    text: string,
    modelName: string = 'embedding-001'
  ): Promise<{ vector: number[] }> {
    try {
      const embeddingModel = this.generativeAI.getGenerativeModel({
        model: modelName,
      });
      
      const result = await embeddingModel.embedContent(text);
      const embedding = result.embedding.values;
      
      return { vector: embedding };
    } catch (error) {
      this.logger.error(`Error embedding text: ${error.message}`);
      throw new Error(`Embedding error: ${error.message}`);
    }
  }

  private getModel(modelName: string): GenerativeModel {
    return this.generativeAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        maxOutputTokens: 2048,
      },
    });
  }

  private formatChatHistory(history: { role: string; content: string }[]): Content[] {
    return history.map(message => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.content }]
    }));
  }
}
