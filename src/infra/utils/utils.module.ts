import { Module } from '@nestjs/common';
import { TokenStoreFactory } from './tokenStoreFactory';
import { DynamoDbTokenStore } from './FileTokenStoreDynamoDB/fileTokenStoreDynamoDB';
import { ConfigModule } from '@nestjs/config';
import { FileTokenStore } from './FileTokenStore/fileTokenStore';

@Module({
  imports: [ConfigModule],
  exports: [TokenStoreFactory, DynamoDbTokenStore],
  providers: [TokenStoreFactory, DynamoDbTokenStore],
})
export class UtilsModule { }
