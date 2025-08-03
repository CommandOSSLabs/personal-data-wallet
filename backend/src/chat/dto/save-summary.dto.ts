import { IsString, IsNotEmpty } from 'class-validator';

export class SaveSummaryDto {
  @IsString()
  @IsNotEmpty()
  sessionId: string;
  
  @IsString()
  @IsNotEmpty()
  summary: string;
  
  @IsString()
  @IsNotEmpty()
  userAddress: string;
}