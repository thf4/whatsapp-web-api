import { Injectable } from '@nestjs/common';
import { SessionService } from './session.service';

@Injectable()
export class MessagesService {
  constructor(private readonly sessionService: SessionService) {}
  async sendMessage(session: string, payload: any): Promise<any> {
    const { message, phone_number, delay = 2 } = payload;
    const client = this.sessionService.getClient(session);

    await client.startTyping(phone_number, delay * 1000);
    const result = await client.sendText(`${phone_number}@c.us`, message, {
      delay: 1000,
    });

    return result;
  }

  async sendMessageAudio(session: string, payload: any): Promise<any> {
    const { phone_number, audio, delay = 2 } = payload;
    const client = this.sessionService.getClient(session);

    await client.startRecording(phone_number, delay * 1000);
    const result = await client.sendPttFromBase64(
      `${phone_number}@c.us`,
      audio,
      'Audio Voice',
    );

    return result;
  }
}
