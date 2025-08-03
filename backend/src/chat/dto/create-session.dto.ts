import { IsString, IsNotEmpty } from 'class-validator';

export class CreateSessionDto {
  @IsString()
  @IsNotEmpty()
  modelName: string;
  
  @IsString()
  @IsNotEmpty()
  userAddress: string;
}