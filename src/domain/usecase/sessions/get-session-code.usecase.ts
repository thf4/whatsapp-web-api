import { Injectable } from '@nestjs/common';
import { SessionService } from '../../../infra/service/session.service';

@Injectable()
export class GetSessionCodeUseCase {
  constructor(private readonly sessionService: SessionService) {}

  async execute(sessionId: string): Promise<any> {
    const session = await this.sessionService.getSessionCode(sessionId);
    return session;
  }
}
