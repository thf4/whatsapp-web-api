import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandInput,
  PutCommand,
  ScanCommand,
  UpdateCommand,
  UpdateCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { Inject, Injectable } from "@nestjs/common";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

@Injectable()
export class DynamoDbTokenStore {
  private readonly tableName = 'TokenStore'; // Substitua pelo nome da sua tabela

  constructor(@Inject('DYNAMODB') private readonly client: DynamoDBDocumentClient,) {
  }

  async getToken(session_name: string): Promise<any> {
    const params: GetCommandInput = {
      TableName: this.tableName,
      Key: {
        session_name: session_name
      }
    };

    const result = await this.client.send(new GetCommand(params));
    if (!result.Item) return null;

    const tokenData = result.Item;
    tokenData.config = JSON.parse(tokenData.config);

    return tokenData;
  }

  async setToken(session_name: string, tokenData: any): Promise<boolean> {
    tokenData.config = JSON.stringify(tokenData); // Armazenar como string JSON no DynamoDB

    const params = {
      TableName: this.tableName,
      Item: {
        webhook: tokenData?.webhook,
        session_name: session_name,
        phone_number: tokenData?.phone_number,
        config: tokenData?.config
      }
    };

    try {
      await this.client.send(new PutCommand(params));
      return true;
    } catch (error) {
      console.error('Error setting token:', error);
      return false;
    }
  }

  async removeToken(session_name: string): Promise<boolean> {
    const params = {
      TableName: this.tableName,
      Key: marshall({ session_name })
    };

    try {
      await this.client.send(new DeleteCommand(params));
      return true;
    } catch (error) {
      console.error('Error deleting token:', error);
      return false;
    }
  }

  async listTokens(): Promise<string[]> {
    const params = {
      TableName: this.tableName
    };

    try {
      const result = await this.client.send(new ScanCommand(params));
      return result.Items.map(item => unmarshall(item).session_name);
    } catch (error) {
      console.error('Error listing tokens:', error);
      return [];
    }
  }
}
