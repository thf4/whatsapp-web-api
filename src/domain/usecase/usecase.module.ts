import { Module } from '@nestjs/common';
import { CreateSessionUseCase } from './create-session.usecase';
import { ServiceModule } from '../../infra/service/service.module';
import { GetSessionCodeUseCase } from './get-session-code.usecase';

@Module({
  imports: [ServiceModule],
  exports: [CreateSessionUseCase, GetSessionCodeUseCase],
  providers: [CreateSessionUseCase, GetSessionCodeUseCase],
})
export class UseCaseModule {}
