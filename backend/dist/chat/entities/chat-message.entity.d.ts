import { ChatSession } from './chat-session.entity';
export declare class ChatMessage {
    id: string;
    role: string;
    content: string;
    metadata: Record<string, any>;
    session: ChatSession;
    sessionId: string;
    createdAt: Date;
}
