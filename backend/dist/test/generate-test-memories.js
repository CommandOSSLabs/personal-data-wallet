"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTestMemories = generateTestMemories;
const generative_ai_1 = require("@google/generative-ai");
const fs_1 = require("fs");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const CATEGORIES = ['GENERAL', 'HEALTH', 'FINANCE', 'WORK', 'PERSONAL', 'PREFERENCES'];
async function generateTestMemories() {
    console.log('Generating test memories using Gemini...\n');
    const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const memories = [];
    const prompt = `Generate 20 realistic personal memories for testing a personal data wallet system.
  Each memory should be a factual statement about a fictional person named Alice Chen.
  Include diverse information across these categories:
  - Personal info (name, age, location, family)
  - Health (allergies, medications, conditions)
  - Finance (budget, savings, investments)
  - Work (job, skills, experience)
  - Preferences (food, hobbies, lifestyle)
  
  Format each memory as a simple statement like:
  "I am allergic to peanuts"
  "My monthly rent is $2000"
  "I work as a senior software engineer"
  
  Make them realistic and diverse. Return only the memories, one per line.`;
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const generatedMemories = text.split('\n')
            .filter(line => line.trim())
            .map((content, index) => ({
            content: content.trim().replace(/^"|"$/g, '').replace(/^\d+\.\s*/, ''),
            category: CATEGORIES[index % CATEGORIES.length],
            metadata: {
                generated: true,
                timestamp: new Date().toISOString(),
                source: 'gemini-test-generator'
            }
        }));
        memories.push(...generatedMemories);
        const specificTestCases = [
            {
                content: "My social security number is 123-45-6789",
                category: "PERSONAL",
                metadata: { sensitive: true, generated: true, timestamp: new Date().toISOString(), source: 'test' }
            },
            {
                content: "I take metformin for type 2 diabetes",
                category: "HEALTH",
                metadata: { sensitive: true, generated: true, timestamp: new Date().toISOString(), source: 'test' }
            },
            {
                content: "My investment portfolio is worth $250,000",
                category: "FINANCE",
                metadata: { sensitive: true, generated: true, timestamp: new Date().toISOString(), source: 'test' }
            },
            {
                content: "I prefer vim over emacs for coding",
                category: "PREFERENCES",
                metadata: { generated: true, timestamp: new Date().toISOString(), source: 'test' }
            },
            {
                content: "My favorite programming language is Rust",
                category: "WORK",
                metadata: { generated: true, timestamp: new Date().toISOString(), source: 'test' }
            }
        ];
        memories.push(...specificTestCases);
        console.log('Generated Test Memories:\n');
        memories.forEach((memory, index) => {
            console.log(`${index + 1}. [${memory.category}] ${memory.content}`);
        });
        console.log(`\nTotal memories generated: ${memories.length}`);
        (0, fs_1.writeFileSync)('test-memories.json', JSON.stringify(memories, null, 2), 'utf8');
        console.log('\nSaved to test-memories.json');
        return memories;
    }
    catch (error) {
        console.error('Error generating memories:', error.message);
        throw error;
    }
}
if (require.main === module) {
    generateTestMemories()
        .then(() => console.log('\nMemory generation complete!'))
        .catch(error => {
        console.error('Failed:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=generate-test-memories.js.map