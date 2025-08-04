import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ChatMessageDto {
  // Support both field naming conventions
  @IsString()
  @IsNotEmpty()
  text: string;
  
  @IsString()
  @IsOptional()
  content?: string; // Alternative field name used in frontend
  
  @IsString()
  @IsNotEmpty()
  userId: string;
  
  @IsString()
  @IsOptional()
  user_id?: string; // Alternative field name used in frontend
  
  @IsString()
  @IsOptional()
  sessionId?: string;
  
  @IsString()
  @IsOptional()
  session_id?: string; // Alternative field name used in frontend
  
  @IsString()
  @IsOptional()
  model?: string;
  
  @IsString()
  @IsOptional()
  modelName?: string; // Alternative field name used in backend
  
  @IsString()
  @IsOptional()
  originalUserMessage?: string;
  
  @IsString()
  @IsOptional()
  memoryContext?: string;
  
  @IsString()
  @IsOptional()
  userAddress?: string; // Used in other DTOs
  
  @IsString()
  @IsOptional()
  userSignature?: string;
}