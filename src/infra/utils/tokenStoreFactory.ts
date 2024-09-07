import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileTokenStore } from './FileTokenStore/fileTokenStore';
import { DynamoDbTokenStore } from './FileTokenStoreDynamoDB/fileTokenStoreDynamoDB'; // Supondo que este seja o nome correto do serviço do DynamoDB

@Injectable()
export class TokenStoreFactory {
  constructor(
    private configService: ConfigService,
    private dynamoDbTokenStore: DynamoDbTokenStore,
  ) { }

  public createTokenStore(client: any) {
    const type = this.configService.get<string>('TOKEN_STORE_TYPE');
    let tokenStore: DynamoDbTokenStore | FileTokenStore;

    if (type === 'dynamodb') {
      tokenStore = this.dynamoDbTokenStore;
    } else {
      tokenStore = new FileTokenStore(client);
    }

    return tokenStore;
  }
}
