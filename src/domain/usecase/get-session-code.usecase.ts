import { Injectable } from '@nestjs/common';
import { WppConnectService } from '../../infra/service/wpp.service';

@Injectable()
export class GetSessionCodeUseCase {
  constructor(private readonly wppConnectService: WppConnectService) {}

  async execute(sessionId: string): Promise<any> {
    try {
      const sessionCode = await this.wppConnectService.getSessionCode(sessionId);
      return {
        success: true,
        sessionCode,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
