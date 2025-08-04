import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateMemoryDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  userAddress: string;
}