import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
export declare class GeminiService {
    private configService;
    private generativeAI;
    private logger;
    constructor(configService: ConfigService);
    generateContent(modelName?: string, history?: {
        role: string;
        content: string;
    }[], systemPrompt?: string): Promise<string>;
    generateContentStream(modelName?: string, history?: {
        role: string;
        content: string;
    }[], systemPrompt?: string): Observable<string>;
    embedText(text: string, modelName?: string): Promise<{
        vector: number[];
    }>;
    private getModel;
    private formatChatHistory;
}
