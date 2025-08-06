import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
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
import { ChatMessage, ChatSession as ChatSessionType } from '../types/chat.types';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatSession } from './entities/chat-session.entity';
import { ChatMessage as ChatMessageEntity } from './entities/chat-message.entity';
import { v4 as uuidv4 } from 'uuid';

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
    @InjectRepository(ChatSession)
    private chatSessionRepository: Repository<ChatSession>,
    @InjectRepository(ChatMessageEntity)
    private chatMessageRepository: Repository<ChatMessageEntity>,
  ) {}

  /**
   * Get all chat sessions for a user
   */
  async getSessions(userAddress: string): Promise<{ success: boolean, sessions: ChatSessionType[], message?: string }> {
    try {
      // First try to get sessions from PostgreSQL
      const dbSessions = await this.chatSessionRepository.find({
        where: { userAddress },
        order: { updatedAt: 'DESC' }
      });

      if (dbSessions.length > 0) {
        // Convert DB sessions to expected format
        const sessions = dbSessions.map(session => ({
          id: session.id,
          owner: session.userAddress,
          title: session.title,
          summary: session.summary,
          created_at: session.createdAt.toISOString(),
          updated_at: session.updatedAt.toISOString(),
          message_count: 0, // Will be populated when needed
          sui_object_id: session.suiObjectId
        } as ChatSessionType));

        return {
          success: true,
          sessions
        };
      }

      // Fallback to blockchain if no sessions in DB
      const blockchainSessions = await this.suiService.getChatSessions(userAddress);
      
      // Store blockchain sessions in PostgreSQL for future use
      if (blockchainSessions.length > 0) {
        await Promise.all(blockchainSessions.map(async (session) => {
          try {
            await this.chatSessionRepository.save({
              id: session.id,
              title: session.title,
              summary: session.summary,
              userAddress,
              suiObjectId: session.id,
              isArchived: false,
              metadata: { source: 'blockchain' }
            });
          } catch (err) {
            this.logger.error(`Error saving blockchain session to DB: ${err.message}`);
          }
        }));
      }

      return {
        success: true,
        sessions: blockchainSessions
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
      // First try to get session from PostgreSQL
      const dbSession = await this.chatSessionRepository.findOne({
        where: { id: sessionId, userAddress },
        relations: ['messages']
      });

      if (dbSession) {
        // Format the response to match frontend expectations
        const session = {
          id: dbSession.id,
          owner: dbSession.userAddress,
          title: dbSession.title,
          summary: dbSession.summary,
          messages: dbSession.messages.map(msg => ({
            id: msg.id,
            content: msg.content,
            type: msg.role,
            timestamp: msg.createdAt.toISOString(),
          })),
          created_at: dbSession.createdAt.toISOString(),
          updated_at: dbSession.updatedAt.toISOString(),
          message_count: dbSession.messages.length,
        };
        
        return {
          success: true,
          session
        };
      }

      // Fallback to blockchain if not in DB
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
      
      // Store in PostgreSQL for future use
      try {
        const newDbSession = await this.chatSessionRepository.save({
          id: sessionId,
          title: rawSession.modelName,
          userAddress,
          suiObjectId: sessionId,
          isArchived: false,
          metadata: { source: 'blockchain' }
        });

        // Store messages
        await Promise.all(rawSession.messages.map(async (msg, idx) => {
          await this.chatMessageRepository.save({
            id: `${sessionId}-${idx}`,
            role: msg.role,
            content: msg.content,
            sessionId: newDbSession.id,
            session: newDbSession
          });
        }));
      } catch (err) {
        this.logger.error(`Error saving blockchain session to DB: ${err.message}`);
      }
      
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
      if (!createSessionDto.userAddress) {
        throw new BadRequestException('User address is required');
      }

      // Generate a new UUID for the session if not provided
      const sessionId = createSessionDto.suiObjectId || uuidv4();
      
      // Create session in PostgreSQL
      const newSession = {
        id: sessionId,
        title: createSessionDto.title || createSessionDto.modelName || 'New Chat',
        userAddress: createSessionDto.userAddress,
        suiObjectId: createSessionDto.suiObjectId || undefined, // Use undefined instead of null
        isArchived: false,
        metadata: { 
          modelName: createSessionDto.modelName || 'gemini-2.0-flash',
          source: createSessionDto.suiObjectId ? 'blockchain' : 'database'
        }
      };
      
      const dbSession = await this.chatSessionRepository.save(newSession);
      
      // Format the session for the frontend
      const session = {
        id: sessionId,
        owner: createSessionDto.userAddress,
        title: createSessionDto.title || createSessionDto.modelName || 'New Chat',
        messages: [],
        created_at: dbSession.createdAt.toISOString(),
        updated_at: dbSession.updatedAt.toISOString(),
        message_count: 0,
        sui_object_id: createSessionDto.suiObjectId
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
      
      // Store message in PostgreSQL
      try {
        const dbSession = await this.chatSessionRepository.findOne({
          where: { id: sessionId }
        });
        
        if (dbSession) {
          await this.chatMessageRepository.save({
            role: messageDto.type,
            content: messageDto.content,
            sessionId: dbSession.id,
            session: dbSession,
            memoryId: messageDto.memoryId,
            walrusHash: messageDto.walrusHash,
            metadata: {
              memoryExtracted: memoryExtracted ? true : false
            }
          });
          
          // Update session updatedAt timestamp
          await this.chatSessionRepository.update(
            { id: sessionId },
            { updatedAt: new Date() }
          );
        }
      } catch (err) {
        this.logger.error(`Error saving message to DB: ${err.message}`);
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
      // Delete from PostgreSQL
      await this.chatSessionRepository.delete({
        id: sessionId,
        userAddress
      });
      
      // Backend doesn't delete from blockchain - frontend handles this
      this.logger.log(`Delete request received for session ${sessionId}`);
      return {
        success: true,
        message: 'Session deleted from database. Blockchain deletion handled by frontend.'
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
      // Update in PostgreSQL
      await this.chatSessionRepository.update(
        { id: sessionId, userAddress },
        { title: newTitle }
      );
      
      // Backend doesn't update blockchain - frontend handles this
      this.logger.log(`Title update request received for session ${sessionId}`);
      return {
        success: true,
        message: 'Session title updated in database. Blockchain update handled by frontend.'
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
        
        // Store in PostgreSQL
        const newSession = {
          id: sessionId,
          title: title || rawSession.modelName,
          userAddress,
          suiObjectId: sessionId,
          isArchived: false,
          metadata: { source: 'blockchain' }
        };
        
        const dbSession = await this.chatSessionRepository.save(newSession);
        
        // Store messages
        if (rawSession.messages && Array.isArray(rawSession.messages)) {
          await Promise.all(rawSession.messages.map(async (msg, idx) => {
            await this.chatMessageRepository.save({
              id: `${sessionId}-${idx}`,
              role: msg.role,
              content: msg.content,
              sessionId: dbSession.id,
              session: dbSession
            });
          }));
        }
      } catch (error) {
        this.logger.error(`Error verifying session: ${error.message}`);
        return { 
          success: false, 
          message: `Failed to verify session ownership: ${error.message}`
        };
      }
      
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
      // Save to PostgreSQL
      await this.chatSessionRepository.update(
        { id: saveSummaryDto.sessionId },
        { summary: saveSummaryDto.summary }
      );
      
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
        
        // Try to get chat history from PostgreSQL first
        let chatHistory: { role: string, content: string }[] = [];
        
        const dbSession = await this.chatSessionRepository.findOne({
          where: { id: sessionId },
          relations: ['messages']
        });
        
        if (dbSession && dbSession.messages) {
          chatHistory = dbSession.messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }));
          chatHistory.push({ role: 'user', content });
        } else {
          // Fallback to blockchain
          const chatSession = await this.suiService.getChatSession(sessionId);
          chatHistory = [...chatSession.messages, { role: 'user', content }];
        }
        
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
          dbSession?.summary || '',
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
              
              // Step 5: Save assistant message to PostgreSQL
              if (dbSession) {
                await this.chatMessageRepository.save({
                  role: 'assistant',
                  content: fullResponse,
                  sessionId: dbSession.id,
                  session: dbSession
                });
                
                // Update session updatedAt timestamp
                await this.chatSessionRepository.update(
                  { id: sessionId },
                  { updatedAt: new Date() }
                );
              }
              
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
      
      // Try to get chat history from PostgreSQL first
      let chatHistory: { role: string, content: string }[] = [];
      let dbSession = null;
      
      dbSession = await this.chatSessionRepository.findOne({
        where: { id: sessionId },
        relations: ['messages']
      });
      
      if (dbSession && dbSession.messages) {
        chatHistory = dbSession.messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));
        chatHistory.push({ role: 'user', content });
      } else {
        // Fallback to blockchain
        const chatSession = await this.suiService.getChatSession(sessionId);
        chatHistory = [...chatSession.messages, { role: 'user', content }];
      }
      
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
        dbSession?.summary || '',
        relevantMemories,
        messageDto.memoryContext || ''
      );
      
      // Step 4: Generate response from Gemini
      const response = await this.geminiService.generateContent(
        modelName,
        chatHistory,
        systemPrompt
      );
      
      // Step 5: Save user and assistant messages to PostgreSQL
      if (dbSession) {
        // Save user message
        await this.chatMessageRepository.save({
          role: 'user',
          content: content,
          sessionId: dbSession.id,
          session: dbSession
        });
        
        // Save assistant message
        await this.chatMessageRepository.save({
          role: 'assistant',
          content: response,
          sessionId: dbSession.id,
          session: dbSession
        });
        
        // Update session updatedAt timestamp
        await this.chatSessionRepository.update(
          { id: sessionId },
          { updatedAt: new Date() }
        );
      }
      
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