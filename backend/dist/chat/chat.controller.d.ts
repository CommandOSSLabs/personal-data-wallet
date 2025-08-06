import type { Response } from 'express';
import { ChatService } from './chat.service';
import { ChatMessageDto } from './dto/chat-message.dto';
import { CreateSessionDto } from './dto/create-session.dto';
import { SaveSummaryDto } from './dto/save-summary.dto';
import { AddMessageDto } from './dto/add-message.dto';
import { UpdateSessionTitleDto } from './dto/update-session-title.dto';
import { ChatSession } from '../types/chat.types';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
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
                type: any;
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
    addMessage(sessionId: string, addMessageDto: AddMessageDto): Promise<{
        success: boolean;
        message?: string;
        memoryExtracted?: import("./chat.service").MemoryExtraction | null;
    }>;
    deleteSession(sessionId: string, userAddress: string): Promise<{
        success: boolean;
        message: string;
    }>;
    updateSessionTitle(sessionId: string, updateTitleDto: UpdateSessionTitleDto): Promise<{
        success: boolean;
        message: string;
    }>;
    saveSummary(saveSummaryDto: SaveSummaryDto): Promise<{
        success: boolean;
    }>;
    streamChat(messageDto: ChatMessageDto, response: Response): Promise<void>;
    sendMessage(messageDto: ChatMessageDto): Promise<{
        response: string;
        success: boolean;
        intent?: string;
        entities?: any;
        memoryStored?: boolean;
        memoryId?: string;
        memoryExtraction?: any;
    }>;
}
