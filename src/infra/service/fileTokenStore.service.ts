import { Injectable } from '@nestjs/common';
import { FileTokenStore as FsTokenStore } from '../utils/FileTokenStore/fileTokenStore';

@Injectable()
export class FileTokenStoreService {
  private readonly tokenStore: FsTokenStore;
  private readonly client: any;

  constructor() {
    this.client = { config: {} }; // Configure seu cliente de acordo com o contexto do NestJS

    // Instancia o FsTokenStore, passando funções de encode e decode personalizadas
    this.tokenStore = new FsTokenStore({
      encodeFunction: (data) => this.encodeFunction(data, this.client.config),
      decodeFunction: (text) => this.decodeFunction(text, this.client),
    });
  }

  private encodeFunction(data: any, config: any): string {
    data.config = config;
    return JSON.stringify(data);
  }

  private decodeFunction(text: string, client: any): any {
    const object = JSON.parse(text);
    if (object.config && Object.keys(client.config).length === 0) {
      client.config = object.config;
    }
    if (object.webhook && Object.keys(client.config).length === 0) {
      client.config.webhook = object.webhook;
    }
    return object;
  }

  // Função para recuperar o token
  public async getToken(sessionName: string): Promise<any> {
    return this.tokenStore.getToken(sessionName);
  }

  // Função para salvar o token
  public async setToken(sessionName: string, tokenData: any): Promise<boolean> {
    return this.tokenStore.setToken(sessionName, tokenData);
  }

  // Função para remover o token
  public async removeToken(sessionName: string): Promise<boolean> {
    return this.tokenStore.removeToken(sessionName);
  }

  // Função para listar tokens
  public async listTokens(): Promise<string[]> {
    return this.tokenStore.listTokens();
  }
}
