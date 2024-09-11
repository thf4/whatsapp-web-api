import { Module } from '@nestjs/common';
import { CreateSessionUseCase } from './sessions/create-session.usecase';
import { ServiceModule } from '../../infra/service/service.module';
import { GetSessionCodeUseCase } from './sessions/get-session-code.usecase';
import { StartAllSessionsUseCase } from './sessions/start-all-sessions.usecase';
import { SendMessageUseCase } from './messages/send-message.usecase';
import { GetProducstUseCase } from './business/get-products.usecase';
import { SendMessageAudioUseCase } from './messages/send-audio.usecase';

@Module({
  imports: [ServiceModule],
  exports: [
    CreateSessionUseCase,
    GetSessionCodeUseCase,
    StartAllSessionsUseCase,
    SendMessageUseCase,
    GetProducstUseCase,
    SendMessageAudioUseCase,
  ],
  providers: [
    CreateSessionUseCase,
    GetSessionCodeUseCase,
    StartAllSessionsUseCase,
    SendMessageUseCase,
    GetProducstUseCase,
    SendMessageAudioUseCase,
  ],
})
export class UseCaseModule {}
