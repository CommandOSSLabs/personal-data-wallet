const { GoogleGenAI } = require('@google/genai');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.test' });

const apiKey = process.env.GOOGLE_AI_API_KEY;

if (!apiKey) {
  console.error('Error: GOOGLE_AI_API_KEY not found in .env.test');
  process.exit(1);
}

console.log('Using API key:', apiKey.substring(0, 10) + '...');
console.log('\nFetching available models...\n');

const ai = new GoogleGenAI({ apiKey });

ai.models.list()
  .then(response => {
    console.log('Available models:');
    console.log(JSON.stringify(response, null, 2));
    
    // Extract just the model names for easy viewing
    if (response.models) {
      console.log('\n\nModel names only:');
      response.models.forEach(model => {
        console.log(`- ${model.name} (supports: ${model.supportedGenerationMethods?.join(', ')})`);
      });
    }
  })
  .catch(error => {
    console.error('Error fetching models:', error);
    console.error('\nError details:', error.message);
  });
