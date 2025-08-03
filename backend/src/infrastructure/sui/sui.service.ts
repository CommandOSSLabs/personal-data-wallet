import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { 
  SuiClient, 
  getFullnodeUrl
} from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { ChatMessage, ChatSession } from '../../types/chat.types';

@Injectable()
export class SuiService {
  private client: SuiClient;
  private packageId: string;
  private adminKeypair: Ed25519Keypair;
  private logger = new Logger(SuiService.name);

  constructor(private configService: ConfigService) {
    // Initialize Sui client
    const network = this.configService.get<string>('SUI_NETWORK', 'testnet');
    
    // Ensure network is a valid Sui network
    let networkUrl: string;
    
    if (network === 'testnet') {
      networkUrl = getFullnodeUrl('testnet');
    } else if (network === 'mainnet') {
      networkUrl = getFullnodeUrl('mainnet');
    } else if (network === 'devnet') {
      networkUrl = getFullnodeUrl('devnet');
    } else if (network === 'localnet') {
      networkUrl = getFullnodeUrl('localnet');
    } else {
      this.logger.warn(`Invalid SUI_NETWORK: ${network}, falling back to testnet`);
      networkUrl = getFullnodeUrl('testnet');
    }
    
    this.client = new SuiClient({ url: networkUrl });
    
    // Get package ID from config
    const packageId = this.configService.get<string>('SUI_PACKAGE_ID');
    if (!packageId) {
      this.logger.warn('SUI_PACKAGE_ID not provided, using default');
      this.packageId = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    } else {
      this.packageId = packageId;
    }
    
    // Initialize admin keypair for gas
    const privateKey = this.configService.get<string>('SUI_ADMIN_PRIVATE_KEY');
    if (privateKey) {
      this.adminKeypair = Ed25519Keypair.fromSecretKey(
        Buffer.from(privateKey.replace('0x', ''), 'hex')
      );
    } else {
      this.logger.warn('SUI_ADMIN_PRIVATE_KEY not provided, some operations may fail');
    }
  }

  // CHAT SESSIONS METHODS

  /**
   * Get all chat sessions for a user
   */
  async getChatSessions(userAddress: string): Promise<ChatSession[]> {
    try {
      // Query all ChatSession objects owned by the user
      const response = await this.client.getOwnedObjects({
        owner: userAddress,
        filter: {
          StructType: `${this.packageId}::chat_sessions::ChatSession`
        },
        options: {
          showContent: true,
        },
      });

      const sessions: ChatSession[] = [];

      for (const item of response.data) {
        if (!item.data?.content) continue;

        const content = item.data.content as any;
        const fields = content.fields;
        
        // Process session data
        sessions.push({
          id: item.data.objectId,
          owner: fields.owner,
          title: fields.model_name, // Use model name as title initially
          messages: this.deserializeMessages(fields.messages),
          created_at: new Date().toISOString(), // Use creation time if available
          updated_at: new Date().toISOString(), // Use update time if available
          message_count: fields.messages.length,
          sui_object_id: item.data.objectId
        });
      }

      return sessions;
    } catch (error) {
      this.logger.error(`Error getting chat sessions: ${error.message}`);
      throw new Error(`Failed to get chat sessions: ${error.message}`);
    }
  }

  /**
   * Create a new chat session
   */
  async createChatSession(userAddress: string, modelName: string): Promise<string> {
    try {
      const tx = new TransactionBlock();
      
      tx.moveCall({
        target: `${this.packageId}::chat_sessions::create_session`,
        arguments: [
          tx.pure(modelName),
        ],
      });

      const result = await this.executeTransaction(tx, userAddress);
      const objectId = this.extractCreatedObjectId(result);
      
      return objectId;
    } catch (error) {
      this.logger.error(`Error creating chat session: ${error.message}`);
      throw new Error(`Failed to create chat session: ${error.message}`);
    }
  }

  /**
   * Add a message to a session
   */
  async addMessageToSession(
    sessionId: string, 
    userAddress: string,
    role: string, 
    content: string
  ): Promise<boolean> {
    try {
      const tx = new TransactionBlock();
      
      // Get the chat session object
      tx.moveCall({
        target: `${this.packageId}::chat_sessions::add_message_to_session`,
        arguments: [
          tx.object(sessionId),
          tx.pure(role),
          tx.pure(content),
        ],
      });

      await this.executeTransaction(tx, userAddress);
      return true;
    } catch (error) {
      this.logger.error(`Error adding message to session: ${error.message}`);
      throw new Error(`Failed to add message to session: ${error.message}`);
    }
  }

  /**
   * Save session summary
   */
  async saveSessionSummary(
    sessionId: string, 
    userAddress: string,
    summary: string
  ): Promise<boolean> {
    try {
      const tx = new TransactionBlock();
      
      tx.moveCall({
        target: `${this.packageId}::chat_sessions::save_session_summary`,
        arguments: [
          tx.object(sessionId),
          tx.pure(summary),
        ],
      });

      await this.executeTransaction(tx, userAddress);
      return true;
    } catch (error) {
      this.logger.error(`Error saving session summary: ${error.message}`);
      throw new Error(`Failed to save session summary: ${error.message}`);
    }
  }

  /**
   * Get a specific chat session
   */
  async getChatSession(sessionId: string): Promise<{
    owner: string;
    modelName: string;
    messages: ChatMessage[];
    summary: string;
  }> {
    try {
      const object = await this.client.getObject({
        id: sessionId,
        options: {
          showContent: true,
        },
      });

      if (!object || !object.data || !object.data.content) {
        throw new Error(`Chat session ${sessionId} not found`);
      }

      const content = object.data.content as any;
      return {
        owner: content.fields.owner,
        modelName: content.fields.model_name,
        messages: this.deserializeMessages(content.fields.messages),
        summary: content.fields.summary,
      };
    } catch (error) {
      this.logger.error(`Error getting chat session: ${error.message}`);
      throw new Error(`Failed to get chat session: ${error.message}`);
    }
  }

  /**
   * Delete a chat session
   */
  async deleteSession(sessionId: string, userAddress: string): Promise<boolean> {
    try {
      // First verify the user owns the session
      const session = await this.getChatSession(sessionId);
      if (session.owner !== userAddress) {
        throw new Error('You do not own this session');
      }
      
      // Create transaction to delete the session
      const tx = new TransactionBlock();
      
      // In a real implementation, you would call a delete function
      // Here we're transferring ownership to a burn address as an example
      tx.transferObjects(
        [tx.object(sessionId)],
        tx.pure('0x000000000000000000000000000000000000000000000000000000000000dead')
      );
      
      await this.executeTransaction(tx, userAddress);
      return true;
    } catch (error) {
      this.logger.error(`Error deleting session: ${error.message}`);
      throw new Error(`Failed to delete session: ${error.message}`);
    }
  }

  /**
   * Update session title (note: this is a mock since our contract doesn't have this function)
   */
  async updateSessionTitle(
    sessionId: string,
    userAddress: string,
    title: string
  ): Promise<boolean> {
    // In a real implementation, we would update the title in the contract
    // For now, we just verify ownership and pretend we updated it
    try {
      const session = await this.getChatSession(sessionId);
      if (session.owner !== userAddress) {
        throw new Error('You do not own this session');
      }
      
      // We would update the title here if the contract supported it
      return true;
    } catch (error) {
      this.logger.error(`Error updating session title: ${error.message}`);
      throw new Error(`Failed to update session title: ${error.message}`);
    }
  }

  // MEMORY METHODS

  /**
   * Create a memory record
   */
  async createMemoryRecord(
    userAddress: string, 
    category: string, 
    vectorId: number,
    blobId: string
  ): Promise<string> {
    try {
      const tx = new TransactionBlock();
      
      tx.moveCall({
        target: `${this.packageId}::memory::create_memory_record`,
        arguments: [
          tx.pure(category),
          tx.pure(vectorId),
          tx.pure(blobId),
        ],
      });

      const result = await this.executeTransaction(tx, userAddress);
      const objectId = this.extractCreatedObjectId(result);
      
      return objectId;
    } catch (error) {
      this.logger.error(`Error creating memory record: ${error.message}`);
      throw new Error(`Failed to create memory record: ${error.message}`);
    }
  }

  /**
   * Create a memory index
   */
  async createMemoryIndex(
    userAddress: string, 
    indexBlobId: string, 
    graphBlobId: string
  ): Promise<string> {
    try {
      const tx = new TransactionBlock();
      
      tx.moveCall({
        target: `${this.packageId}::memory::create_memory_index`,
        arguments: [
          tx.pure(indexBlobId),
          tx.pure(graphBlobId),
        ],
      });

      const result = await this.executeTransaction(tx, userAddress);
      const objectId = this.extractCreatedObjectId(result);
      
      return objectId;
    } catch (error) {
      this.logger.error(`Error creating memory index: ${error.message}`);
      throw new Error(`Failed to create memory index: ${error.message}`);
    }
  }

  /**
   * Update memory index
   */
  async updateMemoryIndex(
    indexId: string,
    userAddress: string,
    expectedVersion: number,
    newIndexBlobId: string,
    newGraphBlobId: string
  ): Promise<boolean> {
    try {
      const tx = new TransactionBlock();
      
      tx.moveCall({
        target: `${this.packageId}::memory::update_memory_index`,
        arguments: [
          tx.object(indexId),
          tx.pure(expectedVersion),
          tx.pure(newIndexBlobId),
          tx.pure(newGraphBlobId),
        ],
      });

      await this.executeTransaction(tx, userAddress);
      return true;
    } catch (error) {
      this.logger.error(`Error updating memory index: ${error.message}`);
      throw new Error(`Failed to update memory index: ${error.message}`);
    }
  }

  /**
   * Get memory index
   */
  async getMemoryIndex(indexId: string): Promise<{
    owner: string;
    version: number;
    indexBlobId: string;
    graphBlobId: string;
  }> {
    try {
      const object = await this.client.getObject({
        id: indexId,
        options: {
          showContent: true,
        },
      });

      if (!object || !object.data || !object.data.content) {
        throw new Error(`Memory index ${indexId} not found`);
      }

      const content = object.data.content as any;
      return {
        owner: content.fields.owner,
        version: Number(content.fields.version),
        indexBlobId: content.fields.index_blob_id,
        graphBlobId: content.fields.graph_blob_id,
      };
    } catch (error) {
      this.logger.error(`Error getting memory index: ${error.message}`);
      throw new Error(`Failed to get memory index: ${error.message}`);
    }
  }

  /**
   * Get memories with a specific vector ID
   */
  async getMemoriesWithVectorId(userAddress: string, vectorId: number): Promise<{
    id: string;
    category: string;
    blobId: string;
  }[]> {
    try {
      // Query memories owned by this user
      const response = await this.client.queryTransactionBlocks({
        filter: {
          MoveFunction: {
            package: this.packageId,
            module: 'memory',
            function: 'create_memory_record',
          },
        },
        options: {
          showInput: true,
          showEffects: true,
          showEvents: true,
        },
      });

      const memories = [];

      // Process the transactions to find memories with matching vectorId
      for (const tx of response.data) {
        for (const event of tx.events || []) {
          if (event.type.includes('::memory::MemoryCreated')) {
            // Check if this memory has the target vectorId and belongs to the user
            const parsedData = event.parsedJson as any;
            if (
              parsedData && 
              parsedData.owner === userAddress &&
              Number(parsedData.vector_id) === vectorId
            ) {
              // Find the memory object created in this transaction
              const objectChanges = tx.objectChanges || [];
              const createdMemory = objectChanges.find(
                change => change.type === 'created' && 
                change.objectType.includes('::memory::Memory')
              );
              
              if (createdMemory) {
                // Get the full memory object to retrieve the blobId
                const memory = await this.client.getObject({
                  id: (createdMemory as any).objectId || '',
                  options: { showContent: true },
                });
                
                if (memory && memory.data && memory.data.content) {
                  const content = memory.data.content as any;
                  (memories as any).push({
                                      id: (createdMemory as any).objectId || '',
                  category: content.fields.category,
                  blobId: content.fields.blob_id,
                  });
                }
              }
            }
          }
        }
      }

      return memories;
    } catch (error) {
      this.logger.error(`Error getting memories with vector ID ${vectorId}: ${error.message}`);
      return [];
    }
  }

  /**
   * Get all memories for a user
   */
  async getUserMemories(userAddress: string): Promise<{
    id: string;
    category: string;
    blobId: string;
  }[]> {
    try {
      // Query all Memory objects owned by the user
      const response = await this.client.getOwnedObjects({
        owner: userAddress,
        filter: {
          StructType: `${this.packageId}::memory::Memory`
        },
        options: {
          showContent: true,
        },
      });

      const memories = [];

      for (const item of response.data) {
        if (!item.data?.content) continue;

        const content = item.data.content as any;
        (memories as any).push({
          id: item.data.objectId,
          category: content.fields.category,
          blobId: content.fields.blob_id,
          vectorId: Number(content.fields.vector_id)
        } as any);
      }

      return memories;
    } catch (error) {
      this.logger.error(`Error getting user memories: ${error.message}`);
      return [];
    }
  }

  /**
   * Get a specific memory
   */
  async getMemory(memoryId: string): Promise<{
    id: string;
    owner: string;
    category: string;
    blobId: string;
    vectorId: number;
  }> {
    try {
      const object = await this.client.getObject({
        id: memoryId,
        options: {
          showContent: true,
        },
      });

      if (!object || !object.data || !object.data.content) {
        throw new Error(`Memory ${memoryId} not found`);
      }

      const content = object.data.content as any;
      return {
        id: memoryId,
        owner: content.fields.owner,
        category: content.fields.category,
        blobId: content.fields.blob_id,
        vectorId: Number(content.fields.vector_id),
      };
    } catch (error) {
      this.logger.error(`Error getting memory: ${error.message}`);
      throw new Error(`Failed to get memory: ${error.message}`);
    }
  }

  /**
   * Delete a memory
   */
  async deleteMemory(memoryId: string, userAddress: string): Promise<boolean> {
    try {
      // First verify the user owns the memory
      const memory = await this.getMemory(memoryId);
      if (memory.owner !== userAddress) {
        throw new Error('You do not own this memory');
      }
      
      // Create transaction to delete the memory
      const tx = new TransactionBlock();
      
      // In a real implementation, you would call a delete function
      // Here we're transferring ownership to a burn address as an example
      tx.transferObjects(
        [tx.object(memoryId)],
        tx.pure('0x000000000000000000000000000000000000000000000000000000000000dead')
      );
      
      await this.executeTransaction(tx, userAddress);
      return true;
    } catch (error) {
      this.logger.error(`Error deleting memory: ${error.message}`);
      throw new Error(`Failed to delete memory: ${error.message}`);
    }
  }

  // Helper methods
  private async executeTransaction(tx: TransactionBlock, sender: string) {
    tx.setSender(sender);
    
    // For demonstration purposes, the admin account is sponsoring the transaction
    // In production, you'd want to implement a proper gas station pattern
    const senderAddress = this.adminKeypair.getPublicKey().toSuiAddress();
    
    return await this.client.signAndExecuteTransactionBlock({
      transactionBlock: tx,
      signer: this.adminKeypair,
      options: {
        showEffects: true,
        showEvents: true,
        showObjectChanges: true,
      },
      requestType: 'WaitForLocalExecution',
    });
  }

  private extractCreatedObjectId(result: any): string {
    try {
      // Extract the object ID from the transaction result
      const created = result.objectChanges.filter(
        change => change.type === 'created'
      )[0];
      
      return created?.objectId || '';
    } catch (error) {
      return '';
    }
  }

  private deserializeMessages(serializedMessages: any): ChatMessage[] {
    try {
      // Convert Sui Move vector to TypeScript array
      return serializedMessages.map(msg => ({
        role: msg.fields.role,
        content: msg.fields.content,
      }));
    } catch (error) {
      return [];
    }
  }
}