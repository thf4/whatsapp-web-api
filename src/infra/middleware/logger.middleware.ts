import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import { createLogger } from '../utils/logger';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger: any;

  constructor(private readonly configService: ConfigService) {
    this.logger = createLogger({
      level: this.configService.get<string>('log.level', 'debug'),
      logger: ['console', 'file'],
    });
  }

  use(req: Request | any, res: Response, next: NextFunction) {
    req.logger = this.logger;
    next();
  }
}