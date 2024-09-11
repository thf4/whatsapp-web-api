import { Module } from '@nestjs/common';
import { TokenStoreFactory } from './tokenStoreFactory';
import { DynamoDbTokenStore } from './FileTokenStoreDynamoDB/fileTokenStoreDynamoDB';
import { ConfigModule } from '@nestjs/config';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

@Module({
  imports: [ConfigModule],
  exports: [TokenStoreFactory, DynamoDbTokenStore, 'DYNAMODB'],
  providers: [
    TokenStoreFactory,
    DynamoDbTokenStore,
    {
      provide: 'DYNAMODB',
      useFactory: () => {
        const client = new DynamoDBClient({
          region: 'sa-east-1',
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          },
        });
        return DynamoDBDocumentClient.from(client);
      },
    },
  ],
})
export class UtilsModule {}
