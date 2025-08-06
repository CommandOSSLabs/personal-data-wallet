import { IsString, IsNotEmpty, IsIn, IsOptional } from 'class-validator';

export class AddMessageDto {
  @IsString()
  @IsNotEmpty()
  userAddress: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['user', 'assistant'])
  type: 'user' | 'assistant';

  @IsString()
  @IsOptional()
  memoryId?: string;

  @IsString()
  @IsOptional()
  walrusHash?: string;
}
