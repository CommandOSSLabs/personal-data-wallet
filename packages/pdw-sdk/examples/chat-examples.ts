/**
 * Chat Service Usage Examples
 * 
 * This file demonstrates how to use the ChatService with the Personal Data Wallet SDK.
 */

import { createPersonalDataWallet } from '../src';
import { SuiClient } from '@mysten/sui/client';

// Example: Basic chat setup
async function basicChatExample() {
  // Initialize the SDK with a Sui client
  const client = new SuiClient({ url: 'https://fullnode.testnet.sui.io:443' });
  const pdw = createPersonalDataWallet(client, {
    apiUrl: 'https://your-backend-api.com',
    suiPackageId: '0xYOUR_PACKAGE_ID'
  });

  const userAddress = '0xYOUR_WALLET_ADDRESS';
  
  // Create a new chat session
  const sessionResponse = await pdw.chat.createSession({
    userAddress,
    modelName: 'gemini-1.5-flash',
    title: 'My First Chat'
  });

  console.log('Created session:', sessionResponse.session.id);
  
  // Send a message (non-streaming)
  const messageResponse = await pdw.chat.sendMessage({
    text: 'Hello! Tell me about my memories.',
    userId: userAddress,
    sessionId: sessionResponse.session.id,
    userAddress
  });

  console.log('Response:', messageResponse.content);
}

// Example: Streaming chat
async function streamingChatExample() {
  const client = new SuiClient({ url: 'https://fullnode.testnet.sui.io:443' });
  const pdw = createPersonalDataWallet(client, {
    apiUrl: 'https://your-backend-api.com',
    suiPackageId: '0xYOUR_PACKAGE_ID'
  });

  const userAddress = '0xYOUR_WALLET_ADDRESS';

  // Create chat interface for easier session management
  const chatInterface = await pdw.chat.createChatInterface(userAddress);
  
  console.log('Chat session created:', chatInterface.sessionId);

  // Stream a message with detailed callbacks
  await chatInterface.streamMessage('What are my recent memories?', {
    onMessage: (event) => {
      const data = JSON.parse(event.data);
      if (data.content) {
        process.stdout.write(data.content);
      }
    },
    onThinking: (event) => {
      console.log('\\n[AI is thinking...]\\n');
    },
    onMemory: (event) => {
      const data = JSON.parse(event.data);
      console.log('\\n[Memory context loaded]\\n');
    },
    onError: (event) => {
      console.error('\\nStreaming error:', event.data);
    },
    onDone: () => {
      console.log('\\n\\n[Response complete]');
    }
  });

  // Update session title
  await chatInterface.updateTitle('Memory Discussion');
  
  // Add a follow-up message
  await chatInterface.addMessage('Thank you for the information!', 'user');
}

// Example: Simple streaming with callback
async function simpleChatExample() {
  const client = new SuiClient({ url: 'https://fullnode.testnet.sui.io:443' });
  const pdw = createPersonalDataWallet(client, {
    apiUrl: 'https://your-backend-api.com',
    suiPackageId: '0xYOUR_PACKAGE_ID'
  });

  const userAddress = '0xYOUR_WALLET_ADDRESS';

  // Create a session
  const session = await pdw.chat.createSession({
    userAddress,
    modelName: 'gemini-1.5-flash',
    title: 'Simple Chat'
  });

  // Use simple streaming method
  await pdw.chat.streamChatSimple(
    {
      text: 'Summarize my memories from last week',
      userId: userAddress,
      sessionId: session.session.id,
      userAddress
    },
    (content) => {
      process.stdout.write(content); // Stream output as it comes
    },
    (error) => {
      console.error('Error:', error);
    },
    () => {
      console.log('\\nDone!');
    }
  );
}

// Example: Session management
async function sessionManagementExample() {
  const client = new SuiClient({ url: 'https://fullnode.testnet.sui.io:443' });
  const pdw = createPersonalDataWallet(client, {
    apiUrl: 'https://your-backend-api.com',
    suiPackageId: '0xYOUR_PACKAGE_ID'
  });

  const userAddress = '0xYOUR_WALLET_ADDRESS';

  // Get all user sessions
  const sessionsResponse = await pdw.chat.getSessions(userAddress);
  console.log(`Found ${sessionsResponse.sessions.length} chat sessions`);

  // Get specific session details
  if (sessionsResponse.sessions.length > 0) {
    const sessionId = sessionsResponse.sessions[0].id;
    const sessionDetails = await pdw.chat.getSession(sessionId, userAddress);
    console.log(`Session "${sessionDetails.session.title}" has ${sessionDetails.session.messages.length} messages`);

    // Update session title
    await pdw.chat.updateSessionTitle(sessionId, userAddress, 'Updated Title');

    // Save a summary
    await pdw.chat.saveSummary({
      sessionId,
      summary: 'This session discussed user memories and provided insights.',
      userAddress
    });

    // Add a message manually
    await pdw.chat.addMessage(sessionId, {
      content: 'This is a manually added message',
      type: 'user',
      userAddress
    });
  }
}

// Example: Using view methods for read operations
async function viewMethodsExample() {
  const client = new SuiClient({ url: 'https://fullnode.testnet.sui.io:443' });
  const pdw = createPersonalDataWallet(client, {
    apiUrl: 'https://your-backend-api.com',
    suiPackageId: '0xYOUR_PACKAGE_ID'
  });

  const userAddress = '0xYOUR_WALLET_ADDRESS';

  // Use view methods for read-only operations
  const sessions = await pdw.view.getChatSessions(userAddress);
  console.log('Chat sessions via view:', sessions.sessions.length);

  if (sessions.sessions.length > 0) {
    const sessionDetails = await pdw.view.getChatSession(sessions.sessions[0].id, userAddress);
    console.log('Session details via view:', sessionDetails.session.title);
  }
}

// Export examples for use
export {
  basicChatExample,
  streamingChatExample,
  simpleChatExample,
  sessionManagementExample,
  viewMethodsExample
};

// If running directly, run basic example
if (require.main === module) {
  basicChatExample().catch(console.error);
}