import { Injectable } from '@nestjs/common';
import { MessagesService } from '../../../infra/service/messages.service';

@Injectable()
export class SendMessageAudioUseCase {
  constructor(private readonly messageService: MessagesService) {}

  async execute(session: string, payload: any): Promise<void> {
    await this.messageService.sendMessageAudio(session, payload);
    return;
  }
}
