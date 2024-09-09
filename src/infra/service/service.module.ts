import { Module } from '@nestjs/common';
import { DynamoDbTokenStoreService } from './dynamodbTokenStore.service';
import { ConfigModule } from '@nestjs/config';
import { UtilsModule } from '../utils/utils.module';
import { SessionService } from './session.service';
import { UtilsService } from './functions';
import { MessagesService } from './messages.service';
import { BusinessService } from './business.service';

@Module({
  imports: [ConfigModule, UtilsModule],
  exports: [DynamoDbTokenStoreService, SessionService, UtilsService, MessagesService, BusinessService],
  providers: [DynamoDbTokenStoreService, SessionService, UtilsService, MessagesService, BusinessService],
})
export class ServiceModule { }
