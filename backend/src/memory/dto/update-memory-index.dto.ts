import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateMemoryIndexDto {
  @IsString()
  @IsNotEmpty()
  indexBlobId: string;
  
  @IsString()
  @IsNotEmpty()
  graphBlobId: string;
  
  @IsString()
  @IsNotEmpty()
  userAddress: string;
  
  @IsNumber()
  expectedVersion: number;
}