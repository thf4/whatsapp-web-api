import { Injectable } from '@nestjs/common';
import { ICreateSessionInput } from '../../interfaces/usecase.interface';
import { SessionService } from '../../../infra/service/session.service';
import { Request } from 'express';

@Injectable()
export class CreateSessionUseCase {
  constructor(private readonly wppConnectService: SessionService) {}

  async execute(
    req: Request,
    res: Response,
    payload: ICreateSessionInput,
  ): Promise<void> {
    const { session_name } = payload;
    await this.wppConnectService.opendata(payload, session_name, res);
    return;
  }
}
