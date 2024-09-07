import { Module } from '@nestjs/common';
import { LoginController } from './login.controller';
import { ServiceModule } from '../infra/service/service.module';
import { UseCaseModule } from '../domain/usecase/usecase.module';

@Module({
  imports: [ServiceModule, UseCaseModule],
  controllers: [LoginController],
  providers: [],
})
export class ControllerModule {}
