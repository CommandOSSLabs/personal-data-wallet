const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:3000';
const USER_ADDRESS = '0x1234567890abcdef1234567890abcdef12345678'; // Test user address
const MODEL_NAME = 'gemini-1.5-pro';

// Helper function to log responses
const logResponse = (endpoint, response) => {
  console.log(`\n--- ${endpoint} ---`);
  console.log('Status:', response.status);
  console.log('Data:', JSON.stringify(response.data, null, 2));
};

// Helper function to handle errors
const handleError = (endpoint, error) => {
  console.error(`\n--- ${endpoint} ERROR ---`);
  if (error.response) {
    console.error('Status:', error.response.status);
    console.error('Data:', error.response.data);
  } else {
    console.error('Error:', error.message);
  }
};

// Test all endpoints
async function testEndpoints() {
  try {
    console.log('Starting backend endpoint tests...');
    
    // Variables to store IDs
    let sessionId;
    let memoryId;
    
    // 1. Create a new chat session
    try {
      const createSessionResponse = await axios.post(`${API_URL}/api/chat/sessions`, {
        userAddress: USER_ADDRESS,
        modelName: MODEL_NAME
      });
      
      logResponse('Create Chat Session', createSessionResponse);
      sessionId = createSessionResponse.data.sessionId || createSessionResponse.data.session?.id;
      
      if (!sessionId) {
        throw new Error('No session ID returned');
      }
    } catch (error) {
      handleError('Create Chat Session', error);
      // Continue with mock sessionId
      sessionId = 'mock-session-id';
    }
    
    // 2. Get all sessions
    try {
      const getSessionsResponse = await axios.get(`${API_URL}/api/chat/sessions?userAddress=${USER_ADDRESS}`);
      logResponse('Get All Sessions', getSessionsResponse);
    } catch (error) {
      handleError('Get All Sessions', error);
    }
    
    // 3. Get a specific session
    try {
      const getSessionResponse = await axios.get(`${API_URL}/api/chat/sessions/${sessionId}?userAddress=${USER_ADDRESS}`);
      logResponse('Get Single Session', getSessionResponse);
    } catch (error) {
      handleError('Get Single Session', error);
    }
    
    // 4. Add a user message to the session
    try {
      const userMessage = "My name is Alice and I live in New York.";
      const addUserMessageResponse = await axios.post(`${API_URL}/api/chat/sessions/${sessionId}/messages`, {
        userAddress: USER_ADDRESS,
        content: userMessage,
        type: 'user'
      });
      
      logResponse('Add User Message', addUserMessageResponse);
    } catch (error) {
      handleError('Add User Message', error);
    }
    
    // 5. Add an assistant message to the session
    try {
      const assistantMessage = "Nice to meet you Alice! I'll remember that you live in New York.";
      const addAssistantMessageResponse = await axios.post(`${API_URL}/api/chat/sessions/${sessionId}/messages`, {
        userAddress: USER_ADDRESS,
        content: assistantMessage,
        type: 'assistant'
      });
      
      logResponse('Add Assistant Message', addAssistantMessageResponse);
    } catch (error) {
      handleError('Add Assistant Message', error);
    }
    
    // 6. Update session title
    try {
      const updateTitleResponse = await axios.put(`${API_URL}/api/chat/sessions/${sessionId}/title`, {
        userAddress: USER_ADDRESS,
        title: "Conversation with Alice"
      });
      
      logResponse('Update Session Title', updateTitleResponse);
    } catch (error) {
      handleError('Update Session Title', error);
    }
    
    // 7. Save session summary
    try {
      const saveSummaryResponse = await axios.post(`${API_URL}/api/chat/summary`, {
        sessionId,
        userAddress: USER_ADDRESS,
        summary: "Initial conversation with Alice who lives in New York."
      });
      
      logResponse('Save Session Summary', saveSummaryResponse);
    } catch (error) {
      handleError('Save Session Summary', error);
    }
    
    // 8. Create a memory
    try {
      const createMemoryResponse = await axios.post(`${API_URL}/api/memories`, {
        content: "Alice lives in New York.",
        category: "location",
        userAddress: USER_ADDRESS
      });
      
      logResponse('Create Memory', createMemoryResponse);
      memoryId = createMemoryResponse.data.memoryId || createMemoryResponse.data.embeddingId;
      
      if (!memoryId) {
        throw new Error('No memory ID returned');
      }
    } catch (error) {
      handleError('Create Memory', error);
      // Continue with mock memoryId
      memoryId = 'mock-memory-id';
    }
    
    // 9. Get all memories
    try {
      const getMemoriesResponse = await axios.get(`${API_URL}/api/memories?user=${USER_ADDRESS}`);
      logResponse('Get All Memories', getMemoriesResponse);
    } catch (error) {
      handleError('Get All Memories', error);
    }
    
    // 10. Search memories
    try {
      const searchMemoriesResponse = await axios.post(`${API_URL}/api/memories/search`, {
        query: "Alice",
        userAddress: USER_ADDRESS,
        k: 5
      });
      
      logResponse('Search Memories', searchMemoriesResponse);
    } catch (error) {
      handleError('Search Memories', error);
    }
    
    // 11. Get memory context
    try {
      const memoryContextResponse = await axios.post(`${API_URL}/api/memories/context`, {
        query_text: "Where does Alice live?",
        user_address: USER_ADDRESS,
        user_signature: "dummy_signature",
        k: 5
      });
      
      logResponse('Get Memory Context', memoryContextResponse);
    } catch (error) {
      handleError('Get Memory Context', error);
    }
    
    // 12. Get memory stats
    try {
      const memoryStatsResponse = await axios.get(`${API_URL}/api/memories/stats?userAddress=${USER_ADDRESS}`);
      logResponse('Get Memory Stats', memoryStatsResponse);
    } catch (error) {
      handleError('Get Memory Stats', error);
    }
    
    // 13. Update memory
    try {
      const updateMemoryResponse = await axios.put(`${API_URL}/api/memories/${memoryId}`, {
        content: "Alice now lives in San Francisco.",
        userAddress: USER_ADDRESS
      });
      
      logResponse('Update Memory', updateMemoryResponse);
    } catch (error) {
      handleError('Update Memory', error);
    }
    
    // 14. Non-streaming chat message
    try {
      const chatResponse = await axios.post(`${API_URL}/api/chat`, {
        text: "What do you remember about Alice?",
        userId: USER_ADDRESS,
        sessionId,
        model: MODEL_NAME
      });
      
      logResponse('Non-Streaming Chat', chatResponse);
    } catch (error) {
      handleError('Non-Streaming Chat', error);
    }
    
    // 15. Delete memory
    try {
      const deleteMemoryResponse = await axios.delete(`${API_URL}/api/memories/${memoryId}`, {
        data: { userAddress: USER_ADDRESS }
      });
      
      logResponse('Delete Memory', deleteMemoryResponse);
    } catch (error) {
      handleError('Delete Memory', error);
    }
    
    // 16. Delete session
    try {
      const deleteSessionResponse = await axios.delete(`${API_URL}/api/chat/sessions/${sessionId}`, {
        data: { userAddress: USER_ADDRESS }
      });
      
      logResponse('Delete Session', deleteSessionResponse);
    } catch (error) {
      handleError('Delete Session', error);
    }
    
    console.log('\nTests completed!');
  } catch (error) {
    console.error('Test suite error:', error.message);
  }
}

// Run the tests
testEndpoints();