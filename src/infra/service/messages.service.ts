import { Injectable } from '@nestjs/common';
import { SessionService } from './session.service';
import { } from '@wppconnect-team/wppconnect';
@Injectable()
export class MessagesService {

  constructor(private readonly sessionService: SessionService) {

  }
  async sendMessage(session: string, payload: any): Promise<any> {
    const { message, phone_number } = payload;
    const client = this.sessionService.getClient(session);

    const result = await client.sendText(`${phone_number}@c.us`, message);

    return result;
  }

  async sendMessageAudio(session: string, payload: any): Promise<any> {
    const { phone_number, audio } = payload;
    const client = this.sessionService.getClient(session);

    const result = await client.sendPttFromBase64(`${phone_number}@c.us`,audio, 'Voice Audio');

    return result;
  }
}