import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { GeminiService } from '../infrastructure/gemini/gemini.service';
import { SuiService } from '../infrastructure/sui/sui.service';
import { ChatMessageDto } from './dto/chat-message.dto';
import { CreateSessionDto } from './dto/create-session.dto';
import { SaveSummaryDto } from './dto/save-summary.dto';
import { SummarizationService } from './summarization/summarization.service';
import { MemoryQueryService } from '../memory/memory-query/memory-query.service';
import { MemoryIngestionService } from '../memory/memory-ingestion/memory-ingestion.service';
import { AddMessageDto } from './dto/add-message.dto';
import { ChatMessage, ChatSession } from '../types/chat.types';

// Interface for memory extraction results
export interface MemoryExtraction {
  shouldSave: boolean;
  category: string;
  content: string;
  extractedFacts: string[];
  confidence: number;
}

interface MessageEvent {
  data: string;
}

@Injectable()
export class ChatService {
  private logger = new Logger(ChatService.name);

  constructor(
    private geminiService: GeminiService,
    private suiService: SuiService,
    private memoryQueryService: MemoryQueryService,
    private memoryIngestionService: MemoryIngestionService,
    private summarizationService: SummarizationService,
  ) {}

  /**
   * Get all chat sessions for a user
   */
  async getSessions(userAddress: string): Promise<{ success: boolean, sessions: ChatSession[], message?: string }> {
    try {
      const sessions = await this.suiService.getChatSessions(userAddress);
      return {
        success: true,
        sessions
      };
    } catch (error) {
      this.logger.error(`Error getting sessions: ${error.message}`);
      return { 
        success: false, 
        sessions: [],
        message: `Error: ${error.message}`
      };
    }
  }

  /**
   * Get a specific chat session
   */
  async getSession(sessionId: string, userAddress: string) {
    try {
      const rawSession = await this.suiService.getChatSession(sessionId);
      
      // Verify ownership
      if (rawSession.owner !== userAddress) {
        throw new NotFoundException('Session not found or you do not have access');
      }
      
      // Format the response to match frontend expectations
      const session = {
        id: sessionId,
        owner: rawSession.owner,
        title: rawSession.modelName, // Use model name as title
        messages: rawSession.messages.map((msg, idx) => ({
          id: `${sessionId}-${idx}`,
          content: msg.content,
          type: msg.role,
          timestamp: new Date().toISOString() // In a real system, we'd store this
        })),
        created_at: new Date().toISOString(), // Mock timestamp
        updated_at: new Date().toISOString(), // Mock timestamp
        message_count: rawSession.messages.length,
        sui_object_id: sessionId
      };
      
      return {
        success: true,
        session
      };
    } catch (error) {
      this.logger.error(`Error getting session: ${error.message}`);
      return {
        success: false,
        message: `Error: ${error.message}`
      };
    }
  }

  /**
   * Create a new chat session or register an existing one
   */
  async createSession(createSessionDto: CreateSessionDto): Promise<{ success: boolean, session?: any, sessionId?: string }> {
    try {
      let sessionId: string;
      
      // Frontend always creates sessions on blockchain
      if (createSessionDto.suiObjectId) {
        sessionId = createSessionDto.suiObjectId;
        this.logger.log(`Using blockchain session ID created by frontend: ${sessionId}`);
      } else {
        // Backend should not create sessions on blockchain
        this.logger.error('Session must be created on blockchain by frontend first');
        return { 
          success: false, 
          sessionId: undefined,
          session: undefined 
        };
      }
      
      // Get the session data
      let rawSession: any;
      try {
        rawSession = await this.suiService.getChatSession(sessionId);
      } catch (error) {
        this.logger.error(`Failed to fetch session data: ${error.message}`);
        // Continue with default values if session fetch fails
      }
      
      // Format the session for the frontend
      const session = {
        id: sessionId,
        owner: rawSession?.owner || createSessionDto.userAddress,
        title: createSessionDto.title || rawSession?.modelName || createSessionDto.modelName,
        messages: rawSession?.messages || [], 
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        message_count: rawSession?.messages?.length || 0,
        sui_object_id: sessionId
      };
      
      return { success: true, session, sessionId };
    } catch (error) {
      this.logger.error(`Error creating chat session: ${error.message}`);
      return { success: false, sessionId: undefined };
    }
  }

  /**
   * Process a message for memory extraction and other backend tasks
   */
  async addMessage(sessionId: string, messageDto: AddMessageDto): Promise<{ success: boolean, message?: string, memoryExtracted?: MemoryExtraction | null }> {
    try {
      this.logger.log(`Message processing request received for session ${sessionId}`);
      
      let memoryExtracted: MemoryExtraction | null = null;
      
      // If it's a user message, check if there are memories to extract
      if (messageDto.type === 'user') {
        try {
          // Check for factual content that could be stored as memory
          memoryExtracted = await this.checkForMemoryContent(
            messageDto.content,
            messageDto.userAddress
          );
          
          this.logger.log('Memory extraction completed', { 
            hasExtraction: !!memoryExtracted,
            factsCount: memoryExtracted?.extractedFacts?.length || 0,
            category: memoryExtracted?.category
          });
        } catch (err) {
          this.logger.error(`Memory extraction error: ${err.message}`);
          memoryExtracted = null;
        }
      }
      
      return { 
        success: true,
        message: 'Message processed successfully',
        memoryExtracted
      };
    } catch (error) {
      this.logger.error(`Error processing message: ${error.message}`);
      return { 
        success: false,
        message: `Error: ${error.message}`
      };
    }
  }

  /**
   * Delete a chat session
   */
  async deleteSession(sessionId: string, userAddress: string): Promise<{ success: boolean, message: string }> {
    try {
      // Backend doesn't delete from blockchain - frontend handles this
      this.logger.log(`Delete request received for session ${sessionId}`);
      return {
        success: true,
        message: 'Session deletion handled by frontend'
      };
    } catch (error) {
      this.logger.error(`Error processing deletion: ${error.message}`);
      return {
        success: false,
        message: `Error: ${error.message}`
      };
    }
  }

  /**
   * Update session title
   */
  async updateSessionTitle(sessionId: string, userAddress: string, newTitle: string): Promise<{ success: boolean, message: string }> {
    try {
      // Backend doesn't update blockchain - frontend handles this
      this.logger.log(`Title update request received for session ${sessionId}`);
      return {
        success: true,
        message: 'Session title update handled by frontend'
      };
    } catch (error) {
      this.logger.error(`Error processing title update: ${error.message}`);
      return {
        success: false,
        message: `Error: ${error.message}`
      };
    }
  }

  /**
   * Index a session that was created directly on the blockchain
   */
  async indexSession(sessionIndexDto: { sessionId: string, userAddress: string, title: string }): Promise<{ success: boolean, message?: string }> {
    try {
      const { sessionId, userAddress, title } = sessionIndexDto;
      
      // Verify the session exists on chain and belongs to the user
      try {
        const rawSession = await this.suiService.getChatSession(sessionId);
        if (rawSession.owner !== userAddress) {
          return { 
            success: false, 
            message: 'Session does not belong to the specified user'
          };
        }
      } catch (error) {
        this.logger.error(`Error verifying session: ${error.message}`);
        return { 
          success: false, 
          message: `Failed to verify session ownership: ${error.message}`
        };
      }
      
      // No need to create the session on-chain since it already exists
      // Just return success
      return {
        success: true,
        message: `Session ${sessionId} indexed successfully`
      };
    } catch (error) {
      this.logger.error(`Error indexing session: ${error.message}`);
      return { 
        success: false,
        message: `Failed to index session: ${error.message}`
      };
    }
  }

  /**
   * Save session summary
   */
  async saveSummary(saveSummaryDto: SaveSummaryDto): Promise<{ success: boolean }> {
    try {
      // Backend doesn't save to blockchain - frontend handles this
      this.logger.log(`Summary save request received for session ${saveSummaryDto.sessionId}`);
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Error processing summary: ${error.message}`);
      return { success: false };
    }
  }

  /**
   * Stream chat response using SSE
   */
  streamChatResponse(messageDto: ChatMessageDto): Observable<MessageEvent> {
    const subject = new Subject<MessageEvent>();
    let fullResponse = '';
    let memoryStored = false;
    let memoryId: string | undefined = undefined;
    
    (async () => {
      try {
        // Send initial start message
        subject.next({ 
          data: JSON.stringify({
            type: 'start',
            intent: 'CHAT'
          })
        });
        
        // Get normalized values from DTO with fallbacks
        const sessionId = messageDto.sessionId || messageDto.session_id;
        const userId = messageDto.userId || messageDto.user_id || messageDto.userAddress;
        const content = messageDto.text || messageDto.content;
        const modelName = messageDto.model || messageDto.modelName || 'gemini-2.0-flash';
        
        // Step 1: Fetch the chat history
        if (!sessionId) {
          throw new Error('Session ID is required for streaming chat');
        }
        
        if (!userId) {
          throw new Error('User ID/Address is required for streaming chat');
        }
        
        if (!content) {
          throw new Error('Message content is required for streaming chat');
        }
        
        const chatSession = await this.suiService.getChatSession(sessionId);
        const chatHistory = [...chatSession.messages, { role: 'user', content }];
        
        // Step 2: Use provided context or fetch relevant memories
        let relevantMemories: string[] = [];
        
        if (messageDto.memoryContext) {
          // Use provided context
          this.logger.log('Using provided memory context');
        } else {
          // Fetch relevant memories
          relevantMemories = await this.memoryQueryService.findRelevantMemories(
            content,
            userId
          );
        }
        
        // Step 3: Construct the system prompt with context
        const systemPrompt = this.constructPrompt(
          chatSession.summary,
          relevantMemories,
          messageDto.memoryContext || ''
        );
        
        // Step 4: Stream response from Gemini
        const responseStream = this.geminiService.generateContentStream(
          modelName,
          chatHistory,
          systemPrompt
        );
        
        responseStream.subscribe({
          next: (chunk) => {
            fullResponse += chunk;
            // Format chunk as expected by frontend
            subject.next({ 
              data: JSON.stringify({
                type: 'chunk',
                content: chunk
              })
            });
          },
          error: (err) => {
            this.logger.error(`Stream error: ${err.message}`);
            subject.error(err);
          },
          complete: async () => {
            try {
              // If originalUserMessage is provided, use that instead
              const userMessage = messageDto.originalUserMessage || content;
              
              // Step 5: Messages are saved by the frontend
              // Backend should not write to blockchain
              this.logger.log('Messages will be saved by frontend after streaming completes');
              
              // Step 6: Process for memory extraction (but don't store yet)
              let memoryExtraction: MemoryExtraction | null = null;
              try {
                memoryExtraction = await this.checkForMemoryContent(userMessage, userId);
              } catch (err) {
                this.logger.error(`Memory extraction error: ${err.message}`);
              }
              
              // Process for summarization
              this.summarizationService.summarizeSessionIfNeeded(sessionId, userId);
              
              memoryStored = false; // No longer auto-storing
              memoryId = undefined;
              
              // Send the final event with completion data including memory extraction
              subject.next({ 
                data: JSON.stringify({
                  type: 'end',
                  content: fullResponse,
                  intent: 'CHAT',
                  memoryStored,
                  memoryId,
                  memoryExtraction: memoryExtraction // Include extracted memory for frontend approval
                })
              });
              
              subject.complete();
            } catch (error) {
              this.logger.error(`Error finalizing chat: ${error.message}`);
              subject.error(new Error(`Failed to finalize chat: ${error.message}`));
            }
          }
        });
      } catch (error) {
        this.logger.error(`Error in chat stream: ${error.message}`);
        subject.error(new Error(`Chat stream failed: ${error.message}`));
      }
    })();
    
    return subject.asObservable();
  }

  /**
   * Send a non-streaming chat message
   */
  async sendMessage(messageDto: ChatMessageDto): Promise<{ 
    response: string; 
    success: boolean;
    intent?: string;
    entities?: any;
    memoryStored?: boolean;
    memoryId?: string;
    memoryExtraction?: any;
  }> {
    try {
      // Get normalized values from DTO with fallbacks
      const sessionId = messageDto.sessionId || messageDto.session_id;
      const userId = messageDto.userId || messageDto.user_id || messageDto.userAddress;
      const content = messageDto.text || messageDto.content;
      const modelName = messageDto.model || messageDto.modelName || 'gemini-1.5-pro';
      
      // Validate required fields
      if (!sessionId) {
        throw new Error('Session ID is required for chat');
      }
      
      if (!userId) {
        throw new Error('User ID/Address is required for chat');
      }
      
      if (!content) {
        throw new Error('Message content is required for chat');
      }
      
      // Step 1: Fetch the chat history
      const chatSession = await this.suiService.getChatSession(sessionId);
      const chatHistory = [...chatSession.messages, { role: 'user', content }];
      
      // Step 2: Use provided context or fetch relevant memories
      let relevantMemories: string[] = [];
      
      if (messageDto.memoryContext) {
        // Use provided context
        this.logger.log('Using provided memory context');
      } else {
        // Fetch relevant memories
        relevantMemories = await this.memoryQueryService.findRelevantMemories(
          content,
          userId
        );
      }
      
      // Step 3: Construct the system prompt with context
      const systemPrompt = this.constructPrompt(
        chatSession.summary,
        relevantMemories,
        messageDto.memoryContext || ''
      );
      
      // Step 4: Generate response from Gemini
      const response = await this.geminiService.generateContent(
        modelName,
        chatHistory,
        systemPrompt
      );
      
      // If originalUserMessage is provided, use that instead
      const userMessage = messageDto.originalUserMessage || content;
      
      // Step 6: Process for memory extraction (but don't store yet)
      let memoryExtraction: MemoryExtraction | null = null;
      try {
        memoryExtraction = await this.checkForMemoryContent(userMessage, userId);
      } catch (err) {
        this.logger.error(`Memory extraction error: ${err.message}`);
      }
      
      // Process for summarization
      this.summarizationService.summarizeSessionIfNeeded(sessionId, userId);
      
      return {
        response,
        success: true,
        intent: 'CHAT',
        memoryStored: false, // No longer auto-storing
        memoryId: undefined,
        memoryExtraction: memoryExtraction // Include extracted memory for frontend approval
      };
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`);
      return {
        response: 'Sorry, an error occurred while processing your message.',
        success: false
      };
    }
  }

  private constructPrompt(
    sessionSummary: string,
    relevantMemories: string[],
    memoryContext: string
  ): string {
    let prompt = 'You are a helpful AI assistant with access to the user\'s personal memories.\n\n';
    
    if (sessionSummary) {
      prompt += `Current conversation summary: ${sessionSummary}\n\n`;
    }
    
    // If we have provided memory context, use that directly
    if (memoryContext) {
      prompt += `${memoryContext}\n\n`;
    }
    // Otherwise use the fetched relevant memories
    else if (relevantMemories.length > 0) {
      prompt += 'Relevant memories from the user:\n';
      relevantMemories.forEach((memory, index) => {
        prompt += `[Memory ${index + 1}]: ${memory}\n`;
      });
      prompt += '\n';
    }
    
    prompt += 'Please respond to the user\'s message in a helpful and informative way, using the provided memories when relevant.';
    
    return prompt;
  }

  private async processCompletedMessage(
    sessionId: string,
    userAddress: string,
    userMessage: string,
    assistantResponse: string
  ): Promise<{ memoryStored: boolean, memoryId?: string }> {
    try {
      // Process for summarization if needed
      this.summarizationService.summarizeSessionIfNeeded(sessionId, userAddress);
      
      // Process for memory ingestion - check if user message contains facts to remember
      const result = await this.memoryIngestionService.processConversation(
        userMessage,
        assistantResponse,
        userAddress
      );
      
      // In a real implementation, this would return whether any memories were stored
      // For now, we'll use a simple heuristic to determine this
      const isUserMessageFactual = await this.isFactual(userMessage);
      
      return {
        memoryStored: isUserMessageFactual,
        memoryId: isUserMessageFactual ? `mem-${Date.now()}` : undefined
      };
    } catch (error) {
      this.logger.error(`Error in post-processing: ${error.message}`);
      return { memoryStored: false };
    }
  }

  private async isFactual(message: string): Promise<boolean> {
    try {
      // Simple heuristic - check for common fact patterns
      const factPatterns = [
        /my name is/i,
        /i am/i,
        /i live/i,
        /i work/i,
        /i have/i,
        /remember/i
      ];
      
      for (const pattern of factPatterns) {
        if (pattern.test(message)) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      this.logger.error(`Error checking factual content: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if message contains factual content that could be stored as memory
   * Returns the extracted facts for frontend approval
   */
  private async checkForMemoryContent(message: string, userAddress: string): Promise<MemoryExtraction | null> {
    try {
      // Use the memory ingestion service's classifier to check if this should be saved
      const classification = await this.memoryIngestionService['classifierService'].shouldSaveMemory(message);
      
      if (!classification.shouldSave) {
        return null;
      }
      
      // If it should be saved, return the extracted information for frontend approval
      // Since ClassificationResult doesn't have extractedFacts, we'll use the message as the fact
      return {
        shouldSave: true,
        category: classification.category,
        content: message,
        extractedFacts: [message], // Default to the full message as the extracted fact
        confidence: classification.confidence || 0.8
      };
    } catch (error) {
      this.logger.error(`Error checking memory content: ${error.message}`);
      return null;
    }
  }
}