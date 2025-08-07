import { Observable } from 'rxjs';
import { GeminiService } from '../infrastructure/gemini/gemini.service';
import { SuiService } from '../infrastructure/sui/sui.service';
import { ChatMessageDto } from './dto/chat-message.dto';
import { CreateSessionDto } from './dto/create-session.dto';
import { SaveSummaryDto } from './dto/save-summary.dto';
import { SummarizationService } from './summarization/summarization.service';
import { MemoryQueryService } from '../memory/memory-query/memory-query.service';
import { MemoryIngestionService } from '../memory/memory-ingestion/memory-ingestion.service';
import { AddMessageDto } from './dto/add-message.dto';
import { ChatSession as ChatSessionType } from '../types/chat.types';
import { Repository } from 'typeorm';
import { ChatSession } from './entities/chat-session.entity';
import { ChatMessage as ChatMessageEntity } from './entities/chat-message.entity';
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
export declare class ChatService {
    private geminiService;
    private suiService;
    private memoryQueryService;
    private memoryIngestionService;
    private summarizationService;
    private chatSessionRepository;
    private chatMessageRepository;
    private logger;
    private activeRequests;
    constructor(geminiService: GeminiService, suiService: SuiService, memoryQueryService: MemoryQueryService, memoryIngestionService: MemoryIngestionService, summarizationService: SummarizationService, chatSessionRepository: Repository<ChatSession>, chatMessageRepository: Repository<ChatMessageEntity>);
    getSessions(userAddress: string): Promise<{
        success: boolean;
        sessions: ChatSessionType[];
        message?: string;
    }>;
    getSession(sessionId: string, userAddress: string): Promise<{
        success: boolean;
        session: {
            id: string;
            owner: string;
            title: string;
            summary: string;
            messages: {
                id: string;
                content: string;
                type: string;
                timestamp: string;
            }[];
            created_at: string;
            updated_at: string;
            message_count: number;
        };
        message?: undefined;
    } | {
        success: boolean;
        session: {
            id: string;
            owner: string;
            title: string;
            messages: {
                id: string;
                content: string;
                type: string;
                timestamp: string;
            }[];
            created_at: string;
            updated_at: string;
            message_count: number;
            sui_object_id: string;
        };
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        session?: undefined;
    }>;
    createSession(createSessionDto: CreateSessionDto): Promise<{
        success: boolean;
        session?: any;
        sessionId?: string;
    }>;
    addMessage(sessionId: string, messageDto: AddMessageDto): Promise<{
        success: boolean;
        message?: string;
        memoryExtracted?: MemoryExtraction | null;
    }>;
    deleteSession(sessionId: string, userAddress: string): Promise<{
        success: boolean;
        message: string;
    }>;
    updateSessionTitle(sessionId: string, userAddress: string, newTitle: string): Promise<{
        success: boolean;
        message: string;
    }>;
    indexSession(sessionIndexDto: {
        sessionId: string;
        userAddress: string;
        title: string;
    }): Promise<{
        success: boolean;
        message?: string;
    }>;
    saveSummary(saveSummaryDto: SaveSummaryDto): Promise<{
        success: boolean;
    }>;
    streamChatResponse(messageDto: ChatMessageDto): Observable<MessageEvent>;
    sendMessage(messageDto: ChatMessageDto): Promise<{
        response: string;
        success: boolean;
        intent?: string;
        entities?: any;
        memoryStored?: boolean;
        memoryId?: string;
        memoryExtraction?: any;
    }>;
    private constructPrompt;
    private processCompletedMessage;
    private isFactual;
    private checkForMemoryContent;
}
export {};
