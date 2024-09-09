import { Module } from '@nestjs/common';
import { LoginController } from './login.controller';
import { ServiceModule } from '../infra/service/service.module';
import { UseCaseModule } from '../domain/usecase/usecase.module';
import { MessagesController } from './messages.controller';
import { BusinessController } from './business.controller';

@Module({
  imports: [ServiceModule, UseCaseModule],
  controllers: [LoginController, MessagesController, BusinessController],
  providers: [],
})
export class ControllerModule {}
