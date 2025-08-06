export declare class AddMessageDto {
    userAddress: string;
    content: string;
    type: 'user' | 'assistant';
    memoryId?: string;
    walrusHash?: string;
}
