import { Injectable } from '@nestjs/common';
import { SessionService } from './session.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MessagesService {

  constructor(private readonly sessionService: SessionService) {

  }
  async sendMessage(session: string, payload: any): Promise<any> {
    const { message, phone_number } = payload;
    const client = this.sessionService.getClient(session);

    await client.startTyping(phone_number, 5000);
    const result = await client.sendText(`${phone_number}@c.us`, message, { delay: 1000 });

    return result;
  }

  async sendMessageAudio(session: string, payload: any): Promise<any> {
    const { phone_number, audio } = payload;
    const client = this.sessionService.getClient(session);

    await client.startTyping(phone_number, 5000);
    const result = await client.sendPttFromBase64(`${phone_number}@c.us`, audio, 'Audio Voice');

    return result;
  }
}