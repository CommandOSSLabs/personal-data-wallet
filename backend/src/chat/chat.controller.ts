import { Controller, Post, Body, Sse, MessageEvent, Get, Query, Delete, Param, Put } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ChatService } from './chat.service';
import { ChatMessageDto } from './dto/chat-message.dto';
import { CreateSessionDto } from './dto/create-session.dto';
import { SaveSummaryDto } from './dto/save-summary.dto';
import { AddMessageDto } from './dto/add-message.dto';
import { UpdateSessionTitleDto } from './dto/update-session-title.dto';
import { SessionIndexDto } from './dto/session-index.dto';
import { ChatSession } from '../types/chat.types';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('sessions')
  async getSessions(@Query('userAddress') userAddress: string): Promise<{ success: boolean, sessions: ChatSession[], message?: string }> {
    return this.chatService.getSessions(userAddress);
  }

  @Get('sessions/:sessionId')
  async getSession(
    @Param('sessionId') sessionId: string, 
    @Query('userAddress') userAddress: string
  ) {
    return this.chatService.getSession(sessionId, userAddress);
  }

  @Post('sessions')
  async createSession(@Body() createSessionDto: CreateSessionDto) {
    return this.chatService.createSession(createSessionDto);
  }

  @Post('sessions/:sessionId/messages')
  async addMessage(
    @Param('sessionId') sessionId: string,
    @Body() addMessageDto: AddMessageDto
  ) {
    return this.chatService.addMessage(sessionId, addMessageDto);
  }

  @Delete('sessions/:sessionId')
  async deleteSession(
    @Param('sessionId') sessionId: string,
    @Body('userAddress') userAddress: string
  ) {
    return this.chatService.deleteSession(sessionId, userAddress);
  }

  @Put('sessions/:sessionId/title')
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

  @Post('sessions/index')
  async indexSession(@Body() sessionIndexDto: SessionIndexDto) {
    return this.chatService.indexSession(sessionIndexDto);
  }

  @Post('summary')
  async saveSummary(@Body() saveSummaryDto: SaveSummaryDto) {
    return this.chatService.saveSummary(saveSummaryDto);
  }

  @Sse('stream')
  streamChat(@Body() messageDto: ChatMessageDto): Observable<MessageEvent> {
    return this.chatService.streamChatResponse(messageDto);
  }

  @Post('')
  async sendMessage(@Body() messageDto: ChatMessageDto) {
    return this.chatService.sendMessage(messageDto);
  }
}