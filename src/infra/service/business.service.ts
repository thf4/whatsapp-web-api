import { Injectable, Logger } from '@nestjs/common';
import { SessionService } from './session.service';
import {} from '@wppconnect-team/wppconnect';
@Injectable()
export class BusinessService {
  private readonly logger: Logger;
  constructor(private readonly sessionService: SessionService) {
    this.logger = new Logger(BusinessService.name);
  }
  async getProducts(session: string, payload: any): Promise<any> {
    const { quantity, phone_number } = payload;
    const client = this.sessionService.getClient(session);

    const result = await client.getProducts(`${phone_number}@c.us`, quantity);

    return result;
  }
}
