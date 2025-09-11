import { Injectable, Logger } from '@nestjs/common';
import { SuiService } from '../../infrastructure/sui/sui.service';
import { GeminiService } from '../../infrastructure/gemini/gemini.service';

@Injectable()
export class SummarizationService {
  private logger = new Logger(SummarizationService.name);

  constructor(
    private suiService: SuiService,
    private geminiService: GeminiService
  ) {}

  async summarizeSessionIfNeeded(sessionId: string, userAddress: string): Promise<void> {
    try {
      // Get the chat session
      const session = await this.suiService.getChatSession(sessionId);
      
      // Check if summarization is needed
      // We'll summarize if we have more than 10 messages and no summary yet,
      // or if we have more than 5 new messages since the last summary
      const shouldSummarize = 
        (session.messages.length > 10 && !session.summary) || 
        (session.summary && session.messages.length > 5);
      
      if (!shouldSummarize) {
        return;
      }

      // Generate the summary
      const summary = await this.generateSummary(
        session.messages.map(msg => ({ role: msg.type, content: msg.content }))
      );
      
      // Save the summary back to the session
      await this.suiService.saveSessionSummary(
        sessionId,
        userAddress,
        summary
      );
      
      this.logger.log(`Summarized session ${sessionId}`);
    } catch (error) {
      this.logger.error(`Error summarizing session: ${error.message}`);
      // Non-blocking operation, so we just log the error
    }
  }

  private async generateSummary(messages: { role: string; content: string }[]): Promise<string> {
    try {
      // Format the conversation for the AI
      const conversation = messages
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n\n');
      
      // Create a prompt for the AI to generate a summary
      const prompt = `
        Please provide a concise summary (2-3 sentences) of the following conversation.
        Focus on the main topics discussed, key questions asked, and important information shared.
        Your summary should help provide context for continuing the conversation.
        
        Conversation:
        ${conversation}
        
        Summary:
      `;
      
      // Generate the summary using Gemini
      const summary = await this.geminiService.generateContent(
        'gemini-1.5-flash', // Using flash for efficiency in summarization
        [{ role: 'user', content: prompt }]
      );
      
      return summary.trim();
    } catch (error) {
      this.logger.error(`Error generating summary: ${error.message}`);
      return 'Error generating summary';
    }
  }
}