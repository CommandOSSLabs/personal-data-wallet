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
import { ChatSession } from '../types/chat.types';
interface MessageEvent {
    data: string;
}
export declare class ChatService {
    private geminiService;
    private suiService;
    private memoryQueryService;
    private memoryIngestionService;
    private summarizationService;
    private logger;
    constructor(geminiService: GeminiService, suiService: SuiService, memoryQueryService: MemoryQueryService, memoryIngestionService: MemoryIngestionService, summarizationService: SummarizationService);
    getSessions(userAddress: string): Promise<{
        success: boolean;
        sessions: ChatSession[];
        message?: string;
    }>;
    getSession(sessionId: string, userAddress: string): Promise<{
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
    }>;
    deleteSession(sessionId: string, userAddress: string): Promise<{
        success: boolean;
        message: string;
    }>;
    updateSessionTitle(sessionId: string, userAddress: string, newTitle: string): Promise<{
        success: boolean;
        message: string;
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
    }>;
    private constructPrompt;
    private processCompletedMessage;
    private isFactual;
}
export {};
