import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateMemoryDto {
  @IsString()
  @IsNotEmpty()
  content: string;
  
  @IsString()
  @IsNotEmpty()
  category: string;
  
  @IsString()
  @IsNotEmpty()
  userAddress: string;
  
  @IsString()
  @IsOptional()
  userSignature?: string;
}