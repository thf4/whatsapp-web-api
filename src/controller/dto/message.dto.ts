import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendMessageDto {
  @IsOptional()
  @IsString()
  phone_number: string;

  @IsNotEmpty()
  @IsString()
  message: string;
}

export class SendMessageAudioDto {
  @IsOptional()
  @IsString()
  phone_number: string;

  @IsNotEmpty()
  @IsString()
  audio: string;
}
