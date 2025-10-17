/**
 * useMemoryChat - Complete memory-aware chat hook with context retrieval
 *
 * Drop-in solution for building memory-aware chatbots with AI integration.
 *
 * @example
 * ```tsx
 * import { useMemoryChat } from 'personal-data-wallet-sdk/hooks';
 * import { useCurrentAccount } from '@mysten/dapp-kit';
 *
 * function ChatInterface() {
 *   const account = useCurrentAccount();
 *
 *   const {
 *     messages,
 *     sendMessage,
 *     createMemoryFromMessage,
 *     isProcessing,
 *     retrievedMemories
 *   } = useMemoryChat(account?.address, {
 *     systemPrompt: 'You are a helpful assistant with access to user memories.',
 *     maxContextMemories: 5,
 *     aiProvider: 'gemini'
 *   });
 *
 *   return (
 *     <div>
 *       {messages.map((msg, i) => (
 *         <div key={i} className={msg.role}>
 *           {msg.content}
 *           {msg.memories && (
 *             <div className="context">
 *               Used {msg.memories.length} memories
 *             </div>
 *           )}
 *         </div>
 *       ))}
 *
 *       <button onClick={() => sendMessage('Hello!')}>
 *         Send Message
 *       </button>
 *
 *       <button onClick={() => createMemoryFromMessage('Save this')}>
 *         💾 Remember this
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
import type { ChatMessage, MemoryChatConfig, SearchMemoryResult, MemoryManagerConfig } from './utils/types';
export interface UseMemoryChatOptions extends MemoryChatConfig {
    /**
     * Optional memory manager config
     */
    config?: MemoryManagerConfig;
    /**
     * Session ID for chat history persistence
     */
    sessionId?: string;
    /**
     * Auto-save messages as memories
     * @default false
     */
    autoSaveMessages?: boolean;
    /**
     * Gemini API key for embeddings
     */
    geminiApiKey?: string;
}
export interface UseMemoryChatReturn {
    /**
     * All chat messages
     */
    messages: ChatMessage[];
    /**
     * Send a message and get AI response
     */
    sendMessage: (content: string) => Promise<void>;
    /**
     * Create a memory from message content
     */
    createMemoryFromMessage: (content: string) => Promise<void>;
    /**
     * Whether the chat is processing (searching/generating response)
     */
    isProcessing: boolean;
    /**
     * Currently retrieved memories for context
     */
    retrievedMemories: SearchMemoryResult[];
    /**
     * Clear chat history
     */
    clearHistory: () => void;
    /**
     * Error if any
     */
    error: Error | null;
}
/**
 * Hook for memory-aware chat with AI integration
 */
export declare function useMemoryChat(userAddress: string | undefined, options?: UseMemoryChatOptions): UseMemoryChatReturn;
export default useMemoryChat;
//# sourceMappingURL=useMemoryChat.d.ts.map