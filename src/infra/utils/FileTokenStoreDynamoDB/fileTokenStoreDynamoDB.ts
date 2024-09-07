import { DynamoDBClient, GetItemCommand, PutItemCommand, DeleteItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { Injectable } from "@nestjs/common";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

@Injectable()
export class DynamoDbTokenStore {
  private readonly tableName = 'TokenStore'; // Substitua pelo nome da sua tabela
  private client: DynamoDBClient;

  constructor() {
    this.client = new DynamoDBClient({ region: 'us-east-1' }); // Configure a região correta
  }

  async getToken(sessionName: string): Promise<any> {
    const params = {
      TableName: this.tableName,
      Key: marshall({ sessionName })
    };

    const result = await this.client.send(new GetItemCommand(params));
    if (!result.Item) return null;

    const tokenData = unmarshall(result.Item);
    tokenData.config = JSON.parse(tokenData.config);

    return tokenData;
  }

  async setToken(sessionName: string, tokenData: any): Promise<boolean> {
    tokenData.sessionName = sessionName;
    tokenData.config = JSON.stringify(tokenData.config); // Armazenar como string JSON no DynamoDB

    const params = {
      TableName: this.tableName,
      Item: marshall(tokenData)
    };

    try {
      await this.client.send(new PutItemCommand(params));
      return true;
    } catch (error) {
      console.error('Error setting token:', error);
      return false;
    }
  }

  async removeToken(sessionName: string): Promise<boolean> {
    const params = {
      TableName: this.tableName,
      Key: marshall({ sessionName })
    };

    try {
      await this.client.send(new DeleteItemCommand(params));
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
      return result.Items.map(item => unmarshall(item).sessionName);
    } catch (error) {
      console.error('Error listing tokens:', error);
      return [];
    }
  }
}
