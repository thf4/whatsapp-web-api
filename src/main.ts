import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { HttpExceptionFilter } from './infra/common/http-exception.filter';
import * as bodyParser from 'body-parser';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);

  app.useLogger(app.get(Logger));
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  const port = configService.get<number>('PORT', 3000);
  await app.listen(port, () => {
    app.get(Logger).log(`Server is running on port: ${port}`);
    app
      .get(Logger)
      .log(`Visit http://localhost:${port}/api-docs for Swagger docs`);
  });
}
bootstrap();
