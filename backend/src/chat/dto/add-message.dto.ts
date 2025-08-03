import { IsString, IsNotEmpty, IsIn } from 'class-validator';

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
}