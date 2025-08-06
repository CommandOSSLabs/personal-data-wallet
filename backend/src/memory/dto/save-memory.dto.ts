import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class SaveMemoryDto {
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
  suiObjectId?: string; // If the memory object was already created on blockchain by frontend
}