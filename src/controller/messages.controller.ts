import { Controller, Post, Body, Param} from '@nestjs/common';
import { SendMessageUseCase } from '../domain/usecase/messages/send-message.usecase';
import { SendMessageAudioDto, SendMessageDto } from './dto/message.dto';
import { SendMessageAudioUseCase } from '../domain/usecase/messages/send-audio.usecase';

@Controller('messages')
export class MessagesController {
  constructor(
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly sendMessageAudioUseCase: SendMessageAudioUseCase,
  ) { }

  @Post(':session/send-message')
  async sendMessage(
    @Param('session') session: string, @Body() payload: SendMessageDto,
  ): Promise<any> {
    return await this.sendMessageUseCase.execute(session, payload);
  }

  @Post(':session/send-audio')
  async sendMessageAudio(
    @Param('session') session: string, @Body() payload: SendMessageAudioDto,
  ): Promise<any> {
    return await this.sendMessageAudioUseCase.execute(session, payload);
  }
}
