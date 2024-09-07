import { Injectable } from '@nestjs/common';
import { DynamoDbTokenStore } from '../utils/FileTokenStoreDynamoDB/fileTokenStoreDynamoDB';

@Injectable()
export class DynamoDbTokenStoreService {
  constructor(private readonly tokenStore: DynamoDbTokenStore) {}

  async getSessionToken(sessionName: string) {
    return this.tokenStore.getToken(sessionName);
  }

  async saveSessionToken(sessionName: string, tokenData: any) {
    return this.tokenStore.setToken(sessionName, tokenData);
  }

  async deleteSessionToken(sessionName: string) {
    return this.tokenStore.removeToken(sessionName);
  }

  async listSessionTokens() {
    return this.tokenStore.listTokens();
  }
}
