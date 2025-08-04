import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class MemoryContextDto {
  @IsString()
  @IsNotEmpty()
  query_text: string;

  @IsString()
  @IsNotEmpty()
  user_address: string;

  @IsString()
  @IsNotEmpty()
  user_signature: string;

  @IsNumber()
  @IsOptional()
  k?: number;
}