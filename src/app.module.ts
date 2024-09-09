import { Module } from '@nestjs/common';
import { ControllerModule } from './controller/controller.module';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import configuration from './infra/config/configuration';

@Module({
  imports: [ControllerModule,
    ConfigModule.forRoot({
    load: [configuration],
    isGlobal: true,
  }),
    LoggerModule.forRoot(),],
  controllers: [],
  providers: [],
})
export class AppModule { }
