import { ChatMessage } from './chat-message.entity';
export declare class ChatSession {
    id: string;
    title: string;
    summary: string;
    userAddress: string;
    isArchived: boolean;
    metadata: Record<string, any>;
    messages: ChatMessage[];
    createdAt: Date;
    updatedAt: Date;
}
