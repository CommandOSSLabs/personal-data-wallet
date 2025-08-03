import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryMemoryDto {
  @IsString()
  @IsNotEmpty()
  query: string;
  
  @IsString()
  @IsNotEmpty()
  userAddress: string;
  
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 5;
}