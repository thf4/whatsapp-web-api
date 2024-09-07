import { Module } from '@nestjs/common';
import { WppConnectService } from './wpp.service';
import { DynamoDbTokenStoreService } from './dynamodbTokenStore.service';
import { ConfigModule } from '@nestjs/config';
import { UtilsModule } from '../utils/utils.module';

@Module({
  imports: [ConfigModule, UtilsModule],
  exports: [WppConnectService, DynamoDbTokenStoreService],
  providers: [WppConnectService, DynamoDbTokenStoreService],
})
export class ServiceModule { }
