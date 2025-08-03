import { SuiService } from '../../infrastructure/sui/sui.service';
import { GeminiService } from '../../infrastructure/gemini/gemini.service';
export declare class SummarizationService {
    private suiService;
    private geminiService;
    private logger;
    constructor(suiService: SuiService, geminiService: GeminiService);
    summarizeSessionIfNeeded(sessionId: string, userAddress: string): Promise<void>;
    private generateSummary;
}
