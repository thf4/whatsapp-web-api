import { Injectable } from '@nestjs/common';
import { WppConnectService } from '../../infra/service/wpp.service';
import { ICreateSessionInput } from '../interfaces/usecase.interface';

@Injectable()
export class CreateSessionUseCase {
  constructor(private readonly wppConnectService: WppConnectService) { }

  async execute(payload: ICreateSessionInput): Promise<any> {
    try {
      const session = await this.wppConnectService.startSession(payload);
      return {
        success: true,
        session,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
