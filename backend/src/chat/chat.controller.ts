import { Controller, Post, Body, Get, Query, Delete, Param, Put, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { Observable } from 'rxjs';
import type { Response } from 'express';
import { ChatService } from './chat.service';
import { ChatMessageDto } from './dto/chat-message.dto';
import { CreateSessionDto } from './dto/create-session.dto';
import { SaveSummaryDto } from './dto/save-summary.dto';
import { AddMessageDto } from './dto/add-message.dto';
import { UpdateSessionTitleDto } from './dto/update-session-title.dto';
import { ChatSession } from '../types/chat.types';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('sessions')
  @ApiOperation({ summary: 'Get all chat sessions for a user' })
  @ApiQuery({ name: 'userAddress', required: true, description: 'The wallet address of the user' })
  @ApiResponse({ status: 200, description: 'Returns all chat sessions for the user' })
  async getSessions(@Query('userAddress') userAddress: string): Promise<{ success: boolean, sessions: ChatSession[], message?: string }> {
    return this.chatService.getSessions(userAddress);
  }

  @Get('sessions/:sessionId')
  @ApiOperation({ summary: 'Get a specific chat session' })
  @ApiParam({ name: 'sessionId', required: true, description: 'The ID of the chat session' })
  @ApiQuery({ name: 'userAddress', required: true, description: 'The wallet address of the user' })
  @ApiResponse({ status: 200, description: 'Returns the chat session with messages' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async getSession(
    @Param('sessionId') sessionId: string, 
    @Query('userAddress') userAddress: string
  ) {
    return this.chatService.getSession(sessionId, userAddress);
  }

  @Post('sessions')
  @ApiOperation({ summary: 'Create a new chat session' })
  @ApiResponse({ status: 201, description: 'The session has been successfully created' })
  @HttpCode(HttpStatus.CREATED)
  async createSession(@Body() createSessionDto: CreateSessionDto) {
    return this.chatService.createSession(createSessionDto);
  }

  @Post('sessions/:sessionId/messages')
  @ApiOperation({ summary: 'Add a message to a chat session' })
  @ApiParam({ name: 'sessionId', required: true, description: 'The ID of the chat session' })
  @ApiResponse({ status: 201, description: 'The message has been successfully added' })
  @HttpCode(HttpStatus.CREATED)
  async addMessage(
    @Param('sessionId') sessionId: string,
    @Body() addMessageDto: AddMessageDto
  ) {
    return this.chatService.addMessage(sessionId, addMessageDto);
  }

  @Delete('sessions/:sessionId')
  @ApiOperation({ summary: 'Delete a chat session' })
  @ApiParam({ name: 'sessionId', required: true, description: 'The ID of the chat session' })
  @ApiResponse({ status: 200, description: 'The session has been successfully deleted' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async deleteSession(
    @Param('sessionId') sessionId: string,
    @Body('userAddress') userAddress: string
  ) {
    return this.chatService.deleteSession(sessionId, userAddress);
  }

  @Put('sessions/:sessionId/title')
  @ApiOperation({ summary: 'Update the title of a chat session' })
  @ApiParam({ name: 'sessionId', required: true, description: 'The ID of the chat session' })
  @ApiResponse({ status: 200, description: 'The session title has been successfully updated' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async updateSessionTitle(
    @Param('sessionId') sessionId: string,
    @Body() updateTitleDto: UpdateSessionTitleDto
  ) {
    return this.chatService.updateSessionTitle(
      sessionId, 
      updateTitleDto.userAddress,
      updateTitleDto.title
    );
  }

  @Post('summary')
  @ApiOperation({ summary: 'Save a summary for a chat session' })
  @ApiResponse({ status: 200, description: 'The summary has been successfully saved' })
  async saveSummary(@Body() saveSummaryDto: SaveSummaryDto) {
    return this.chatService.saveSummary(saveSummaryDto);
  }

  @Post('sessions/:sessionId/rename')
  @ApiOperation({ summary: 'Rename a chat session' })
  @ApiResponse({ status: 200, description: 'Session renamed successfully' })
  async renameSession(
    @Param('sessionId') sessionId: string,
    @Body('title') title: string,
    @Body('userAddress') userAddress: string
  ) {
    return this.chatService.updateSessionTitle(sessionId, userAddress, title);
  }

  @Post('stream')
  @ApiOperation({ summary: 'Stream chat responses using Server-Sent Events' })
  @ApiResponse({ status: 200, description: 'Streaming chat response' })
  async streamChat(@Body() messageDto: ChatMessageDto, @Res() response: Response) {
    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Connection', 'keep-alive');
    response.setHeader('Access-Control-Allow-Origin', '*');

    const observable = this.chatService.streamChatResponse(messageDto);
    
    observable.subscribe({
      next: (event) => {
        response.write(`data: ${event.data}\n\n`);
      },
      error: (error) => {
        console.error('Streaming error:', error);
        response.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
        response.end();
      },
      complete: () => {
        response.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
        response.end();
      }
    });
  }

  @Post('')
  @ApiOperation({ summary: 'Send a non-streaming chat message' })
  @ApiResponse({ status: 200, description: 'Chat response generated successfully' })
  async sendMessage(@Body() messageDto: ChatMessageDto) {
    return this.chatService.sendMessage(messageDto);
  }
}
