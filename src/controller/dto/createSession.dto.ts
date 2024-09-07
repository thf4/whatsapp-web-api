import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSessionDto {

  @IsNotEmpty()
  @IsString()
  webHook: string;

  @IsNotEmpty()
  @IsString()
  phone_number: string;

  @IsNotEmpty()
  @IsString()
  session_name: string;
}