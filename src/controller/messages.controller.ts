import { Controller, Post, Body, Param} from '@nestjs/common';
import { SendMessageUseCase } from '../domain/usecase/messages/send-message.usecase';
import { SendMessageDto } from './dto/message.dto';

@Controller('messages')
export class MessagesController {
  constructor(
    private readonly sendMessageUseCase: SendMessageUseCase,
  ) { }

  @Post(':session/send-message')
  async sendMessage(
    @Param('session') session: string, @Body() payload: SendMessageDto,
  ): Promise<any> {
    return await this.sendMessageUseCase.execute(session, payload);
  }
}
