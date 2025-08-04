import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ProcessMemoryDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  userAddress: string;
  
  @IsString()
  @IsOptional()
  category?: string;
}