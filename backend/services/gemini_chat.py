import google.generativeai as genai
from typing import AsyncGenerator
import asyncio
import logging
from config import settings

logger = logging.getLogger(__name__)

class GeminiChatService:
    def __init__(self):
        self.api_key = settings.google_api_key
        if not self.api_key:
            logger.warning("GOOGLE_API_KEY not found, Gemini chat will not work")
            self.model = None
            return
            
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        logger.info("Gemini chat service initialized successfully")
    
    def is_available(self) -> bool:
        """Check if Gemini service is available"""
        return self.model is not None
    
    async def generate_response(self, prompt: str, context: str = "") -> str:
        """Generate a non-streaming response"""
        if not self.is_available():
            return "I'm sorry, but I'm currently unavailable. Please try again later."
        
        try:
            # Combine context and prompt
            full_prompt = f"{context}\n\nUser: {prompt}" if context else prompt
            
            response = self.model.generate_content(full_prompt)
            return response.text
        except Exception as e:
            logger.error(f"Error generating Gemini response: {e}")
            return "I apologize, but I encountered an error while processing your request."
    
    async def generate_streaming_response(self, prompt: str, context: str = "") -> AsyncGenerator[str, None]:
        """Generate a streaming response"""
        if not self.is_available():
            yield "I'm sorry, but I'm currently unavailable. Please try again later."
            return
        
        try:
            # Build a proper system prompt with context
            if context:
                system_prompt = f"""You are a knowledgeable AI assistant. Here's relevant context about the user:

{context}

Please provide a helpful, comprehensive response to the user's question. Use markdown formatting for better readability.
For research questions, provide detailed, accurate information with clear structure.
If you need clarification, ask specific questions to better understand what the user is looking for.

User's question: {prompt}"""
            else:
                system_prompt = f"""You are a knowledgeable AI assistant. Please provide a helpful, comprehensive response to the user's question.
Use markdown formatting for better readability. For research questions, provide detailed, accurate information with clear structure.
If you need clarification, ask specific questions to better understand what the user is looking for.

User's question: {prompt}"""

            logger.info(f"Generating streaming response for prompt length: {len(system_prompt)}")
            logger.debug(f"System prompt preview: {system_prompt[:300]}...")

            # Generate streaming response
            response = self.model.generate_content(system_prompt, stream=True)

            for chunk in response:
                if chunk.text:
                    yield chunk.text
                    # Small delay to make streaming visible
                    await asyncio.sleep(0.01)

        except Exception as e:
            logger.error(f"Error generating streaming Gemini response: {e}")
            yield "I apologize, but I encountered an error while processing your request."
    
    def build_context_from_memory(self, memories: list, intent: str) -> str:
        """Build context string from memory items"""
        context_parts = [
            "You are a knowledgeable AI assistant with access to web search and research capabilities.",
            "When users ask for research or information about topics, provide comprehensive, accurate, and well-structured responses.",
            "Use **bold** for emphasis, `code` for technical terms, and proper formatting for lists and headings.",
            "For research queries, provide detailed explanations, key facts, and relevant context.",
            "If you need to clarify what the user is asking about, ask specific questions to help narrow down the topic."
        ]

        if memories:
            context_parts.append("\nRelevant context about the user:")
            for memory in memories[:3]:  # Limit to top 3 memories for clarity
                context_parts.append(f"- {memory.get('content', '')}")

        if intent == 'QUERY':
            context_parts.append("\nThe user is asking for information or research. Provide a comprehensive, well-researched response with clear structure and relevant details.")
        elif intent == 'FACT_ADDITION':
            context_parts.append("\nThe user is sharing new information. Acknowledge it and relate it to what you already know.")
        else:
            context_parts.append("\nEngage in a helpful conversation with the user.")

        return "\n".join(context_parts)