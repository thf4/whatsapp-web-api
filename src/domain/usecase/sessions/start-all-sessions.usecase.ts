import { Injectable } from '@nestjs/common';
import { SessionService } from '../../../infra/service/session.service';
import { Request } from 'express';

@Injectable()
export class StartAllSessionsUseCase {
  constructor(private readonly sessionUtils: SessionService,
  ) { }
  async execute(req: Request, res: Response) {

    const allSessions = await this.sessionUtils.getAllTokens();

    allSessions.map(async (session: string) => await this.sessionUtils.opendata(req as any, session));

    return res;
  }
}