import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSessionDto {
  @IsNotEmpty()
  @IsString()
  webhook: string;

  @IsOptional()
  @IsString()
  phone_number: string;

  @IsNotEmpty()
  @IsString()
  session_name: string;
}
