import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class SearchMemoryDto {
  @IsString()
  @IsNotEmpty()
  query: string;

  @IsString()
  @IsNotEmpty()
  userAddress: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsNumber()
  @IsOptional()
  k?: number;

  @IsString()
  @IsOptional()
  userSignature?: string;
}