import { Module } from '@nestjs/common';
import { CreateSessionUseCase } from './sessions/create-session.usecase';
import { ServiceModule } from '../../infra/service/service.module';
import { GetSessionCodeUseCase } from './sessions/get-session-code.usecase';
import { StartAllSessionsUseCase } from './sessions/start-all-sessions.usecase';
import { SendMessageUseCase } from './messages/send-message.usecase';
import { GetProducstUseCase } from './business/get-products.usecase';

@Module({
  imports: [ServiceModule],
  exports: [CreateSessionUseCase, GetSessionCodeUseCase, StartAllSessionsUseCase, SendMessageUseCase, GetProducstUseCase],
  providers: [CreateSessionUseCase, GetSessionCodeUseCase, StartAllSessionsUseCase, SendMessageUseCase, GetProducstUseCase],
})
export class UseCaseModule { }
