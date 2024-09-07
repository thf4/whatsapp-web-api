import { Controller, Post, Body, Get, Param, Request, Response } from '@nestjs/common';
import { CreateSessionUseCase } from '../domain/usecase/create-session.usecase';
import { GetSessionCodeUseCase } from '../domain/usecase/get-session-code.usecase';
import { CreateSessionDto } from './dto/createSession.dto';

@Controller('auth')
export class LoginController {
  constructor(
    private readonly loginUseCase: CreateSessionUseCase,
    private readonly getSessionCodeUseCase: GetSessionCodeUseCase,
  ) {}

  @Post('create-session')
  async login(
    @Body() payload: CreateSessionDto,
  ): Promise<any> {
    return await this.loginUseCase.execute(payload);
  }

  @Get(':sessionId')
  async getSessionCode(@Param('sessionId') sessionId: string): Promise<any> {
    return await this.getSessionCodeUseCase.execute(sessionId);
  }
}
