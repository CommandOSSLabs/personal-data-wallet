import { Injectable, Logger } from '@nestjs/common';
import { GeminiService } from '../../infrastructure/gemini/gemini.service';

export interface ClassificationResult {
  shouldSave: boolean;
  confidence: number;
  category: string;
  reasoning: string;
}

@Injectable()
export class ClassifierService {
  private readonly logger = new Logger(ClassifierService.name);
  
  // Regex patterns for detecting factual statements
  private readonly factPatterns = [
    /my name is ([a-zA-Z\s]+)/i,
    /my email is ([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
    /i live in ([a-zA-Z\s,]+)/i,
    /i work at ([a-zA-Z\s,&]+)/i,
    /i am from ([a-zA-Z\s,]+)/i,
    /i was born in ([a-zA-Z0-9\s,]+)/i,
    /my birthday is ([a-zA-Z0-9\s,]+)/i,
    /my phone (?:number|#) is ([0-9+\-\s()]+)/i,
    /my address is ([a-zA-Z0-9\s,]+)/i,
    /remember that ([^.!?]+)/i,
    /don't forget that ([^.!?]+)/i,
    /please remember ([^.!?]+)/i,
  ];
  
  // Map of regex patterns to categories
  private readonly categoryMap = {
    '/my name is/i': 'personal_info',
    '/my email is/i': 'contact',
    '/i live in/i': 'location',
    '/i work at/i': 'career',
    '/i am from/i': 'background',
    '/i was born/i': 'background',
    '/my birthday/i': 'personal_info',
    '/my phone/i': 'contact',
    '/my address/i': 'contact',
    '/remember that/i': 'custom',
    '/don\'t forget/i': 'custom',
    '/please remember/i': 'custom',
  };
  
  constructor(private geminiService: GeminiService) {}
  
  /**
   * Determine if a message contains information worth saving
   * @param message User message to classify
   * @returns Classification result
   */
  async shouldSaveMemory(message: string): Promise<ClassificationResult> {
    try {
      // Step 1: Check for obvious patterns using regex
      for (const pattern of this.factPatterns) {
        const match = message.match(pattern);
        if (match) {
          // Get the category based on the pattern
          const patternString = pattern.toString();
          const category = this.getCategoryForPattern(patternString);
          
          return {
            shouldSave: true,
            confidence: 0.95,
            category,
            reasoning: `Matched pattern: ${patternString}`
          };
        }
      }
      
      // Step 2: Use Gemini for more complex classification
      return await this.classifyWithGemini(message);
    } catch (error) {
      this.logger.error(`Error classifying memory: ${error.message}`);
      return {
        shouldSave: false,
        confidence: 0,
        category: 'unknown',
        reasoning: `Error: ${error.message}`
      };
    }
  }
  
  /**
   * Use Gemini to classify a message
   * @param message User message to classify
   * @returns Classification result
   */
  private async classifyWithGemini(message: string): Promise<ClassificationResult> {
    try {
      const prompt = `
Analyze the following message to determine if it contains personal information or facts that should be saved to a personal memory database.

Message: "${message}"

Answer as JSON with the following format:
{
  "shouldSave": true/false,
  "confidence": [0.0-1.0],
  "category": "personal_info|location|career|contact|preference|background|health|custom",
  "reasoning": "Brief explanation"
}

Only say "true" if the message CLEARLY contains a personal fact, preference or information that would be useful to remember later.
`;

      const responseText = await this.geminiService.generateContent(
        'gemini-1.5-flash',
        [{ role: 'user', content: prompt }]
      );
      
      try {
        const result = JSON.parse(responseText);
        return {
          shouldSave: result.shouldSave || false,
          confidence: result.confidence || 0,
          category: result.category || 'unknown',
          reasoning: result.reasoning || 'No reasoning provided'
        };
      } catch (parseError) {
        this.logger.error(`Error parsing classification result: ${parseError.message}`);
        return {
          shouldSave: false,
          confidence: 0,
          category: 'unknown',
          reasoning: `Parse error: ${parseError.message}`
        };
      }
    } catch (error) {
      this.logger.error(`Error using Gemini for classification: ${error.message}`);
      return {
        shouldSave: false,
        confidence: 0,
        category: 'unknown',
        reasoning: `Gemini error: ${error.message}`
      };
    }
  }
  
  /**
   * Get category for a regex pattern
   * @param patternString String representation of the regex
   * @returns Category string
   */
  private getCategoryForPattern(patternString: string): string {
    // Look up the category in our map
    for (const [key, value] of Object.entries(this.categoryMap)) {
      if (patternString.includes(key.replace(/^\/|\/[a-z]*$/g, ''))) {
        return value;
      }
    }
    
    return 'custom';
  }
}