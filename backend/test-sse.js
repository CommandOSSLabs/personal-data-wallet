const fetch = require('node-fetch');
const EventSource = require('eventsource');

// Test variables
const API_URL = 'http://localhost:3000';
const USER_ADDRESS = '0x1234567890abcdef1234567890abcdef12345678';
const MODEL_NAME = 'gemini-1.5-pro';
let SESSION_ID = null;

// Test SSE streaming connection
async function testSSEStreaming() {
  console.log('\n--- Testing SSE Streaming ---');
  
  try {
    if (!SESSION_ID) {
      // Create a session first
      console.log('Creating a new chat session...');
      const sessionResponse = await fetch(`${API_URL}/api/chat/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: USER_ADDRESS,
          modelName: MODEL_NAME
        })
      });
      
      const sessionData = await sessionResponse.json();
      SESSION_ID = sessionData.sessionId || sessionData.session?.id;
      
      if (!SESSION_ID) {
        throw new Error('Failed to create session: ' + JSON.stringify(sessionData));
      }
      
      console.log(`Created session with ID: ${SESSION_ID}`);
    }
    
    // Test streaming request
    const queryText = "Tell me about yourself in 3 short sentences.";
    console.log(`Sending streaming request with text: "${queryText}"`);
    
    // Prepare request URL and data
    const url = `${API_URL}/api/chat/stream`;
    const requestData = {
      text: queryText,
      userId: USER_ADDRESS,
      sessionId: SESSION_ID,
      model: MODEL_NAME,
      originalUserMessage: queryText
    };
    
    // Use EventSource for SSE connection
    console.log('Creating EventSource connection...');
    const fullUrl = `${url}?${new URLSearchParams({
      text: requestData.text,
      userId: requestData.userId,
      sessionId: requestData.sessionId,
      model: requestData.model,
    })}`;
    
    const eventSource = new EventSource(fullUrl);
    
    // Track chunks received
    let totalChunks = 0;
    let fullResponse = '';
    let receivedStart = false;
    let receivedEnd = false;
    
    // Handle connection open
    eventSource.onopen = () => {
      console.log('SSE Connection opened');
    };
    
    // Handle messages
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        totalChunks++;
        
        if (data.type === 'start') {
          receivedStart = true;
          console.log('Received START event with intent:', data.intent);
        }
        else if (data.type === 'chunk' && data.content) {
          process.stdout.write(data.content);
          fullResponse += data.content;
        }
        else if (data.type === 'end') {
          receivedEnd = true;
          console.log('\n\nReceived END event');
          console.log('Memory detection:', data.memoryStored ? 'YES' : 'NO');
          if (data.memoryId) {
            console.log('Memory ID:', data.memoryId);
          }
          
          // Close connection
          eventSource.close();
          
          // Report success
          console.log('\nSSE Test Results:');
          console.log(`- Received START event: ${receivedStart ? '✅' : '❌'}`);
          console.log(`- Received ${totalChunks - 2} content chunks`); // -2 for start/end events
          console.log(`- Received END event: ${receivedEnd ? '✅' : '❌'}`);
          console.log(`- Total response length: ${fullResponse.length} characters`);
          
          if (receivedStart && receivedEnd && fullResponse.length > 0) {
            console.log('\n✅ SSE TEST PASSED!');
          } else {
            console.log('\n❌ SSE TEST FAILED!');
          }
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };
    
    // Handle errors
    eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      eventSource.close();
      console.log('❌ SSE TEST FAILED with connection error');
    };
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

// Run the test
testSSEStreaming();