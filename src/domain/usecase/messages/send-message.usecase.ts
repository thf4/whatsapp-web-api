import { Injectable } from '@nestjs/common';
import { MessagesService } from '../../../infra/service/messages.service';

@Injectable()
export class SendMessageUseCase {
  constructor(private readonly messageService: MessagesService) { }

  async execute(session: string, payload: any): Promise<void> {
    await this.messageService.sendMessage(session, payload);
    return;
  }
}
