import { Controller, Post, Body, Get, Param, Response, Next, Req, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { CreateSessionUseCase } from '../domain/usecase/sessions/create-session.usecase';
import { GetSessionCodeUseCase } from '../domain/usecase/sessions/get-session-code.usecase';
import { CreateSessionDto } from './dto/createSession.dto';
import { NextFunction, Request } from 'express';
import { StartAllSessionsUseCase } from '../domain/usecase/sessions/start-all-sessions.usecase';

@Controller('auth')
export class LoginController {
  constructor(
    private readonly loginUseCase: CreateSessionUseCase,
    private readonly getSessionCodeUseCase: GetSessionCodeUseCase,
    private readonly startAllSessionsUseCase: StartAllSessionsUseCase,
  ) { }

  @Post('create-session')
  async login(
    @Req() req: Request, @Res() res: Response, @Body() payload: CreateSessionDto, @Next() next: NextFunction
  ): Promise<any> {
    await this.loginUseCase.execute(req, res, payload);
    next();
  }

  @Get(':sessionId')
  async getSessionCode(@Param('sessionId') sessionId: string): Promise<any> {
    return await this.getSessionCodeUseCase.execute(sessionId);
  }

  @Post('/start-all-sessions')
  @HttpCode(HttpStatus.NO_CONTENT)
  async startAllSessions(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    await this.startAllSessionsUseCase.execute(req, res);
    next();
  }
}
