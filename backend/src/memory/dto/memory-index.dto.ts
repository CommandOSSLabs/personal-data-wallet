import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class MemoryIndexDto {
  @IsString()
  @IsNotEmpty()
  memoryId: string;

  @IsString()
  @IsNotEmpty()
  userAddress: string;
  
  @IsString()
  @IsOptional()
  category?: string;
  
  @IsString()
  @IsOptional()
  walrusHash?: string;
}