import { IsString, IsNotEmpty } from 'class-validator';

export class SessionIndexDto {
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @IsString()
  @IsNotEmpty()
  userAddress: string;

  @IsString()
  @IsNotEmpty()
  title: string;
}