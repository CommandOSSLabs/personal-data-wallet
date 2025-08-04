import { Optional } from '@nestjs/common';
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class SearchMemoryDto {
  @IsString()
  @IsOptional()
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