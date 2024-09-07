import { Injectable, OnModuleInit } from '@nestjs/common';
import * as wppconnect from '@wppconnect-team/wppconnect';
import { create, Whatsapp } from '@wppconnect-team/wppconnect';
import * as fs from 'fs/promises';
import * as path from 'path';
import { TokenStoreFactory } from '../utils/tokenStoreFactory';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ICreateSessionInput } from '../../domain/interfaces/usecase.interface';

interface SessionData {
  name: string;
  client: Whatsapp;
  state: string;
  status: string;
  phoneCode?: string;
}

@Injectable()
export class WppConnectService implements OnModuleInit {
  private sessions: Map<string, SessionData> = new Map();
  private readonly TOKEN_DIR = 'userDataDir';
  private clientsArray: any;
  private code: any;
  constructor(private tokenStoreFactory: TokenStoreFactory) {
    this.clientsArray = []
    this.code = {}
  }
  async onModuleInit() {
    await this.reconnectAllSessions();
  }

  async startSession(payload: any): Promise<SessionData> {
    const { session_name, phone_number } = payload;
    try {

      let client: any = this.sessions.get(session_name);
      let clientConfig = {
        ...client,
        config: {
          ...payload
        }
      }
      const tokenStore = this.tokenStoreFactory;
      const myTokenStore = tokenStore.createTokenStore(clientConfig);
      const tokenData = await myTokenStore.getToken(session_name);

      myTokenStore.setToken(session_name, tokenData ?? clientConfig);

      const clientSession = await create({
        session: session_name,
        tokenStore: myTokenStore,
        folderNameToken: 'userDataDir',
        phoneNumber: phone_number,
        autoClose: 10000,
        logQR: false,
        catchQR: (base64Qrimg, asciiQR, attempts, urlCode) => {
          console.log(`Nova sessão ${session_name}. Por favor, escaneie o QR code.`);
          // Implemente a lógica para mostrar o QR code ao usuário, se necessário
        },
        catchLinkCode: (code) => {
          this.code = { [session_name]: code };
          Object.assign(clientConfig, {
            status: 'PHONECODE',
            phoneCode: code,
            phone: phone_number,
          });
        },
        statusFind: (statusSession, session_name) => {
          console.log(`Status da sessão ${session_name}:`, statusSession);
        },
      });

      const sessionData: SessionData = {
        name: session_name,
        client: clientSession,
        state: 'CONNECTED',
        status: 'LOGGED',
      };

      this.sessions.set(session_name, sessionData);
      client = this.clientsArray[session_name] = Object.assign(clientSession, client);
      return sessionData;
    } catch (error) {
      throw new Error('Error starting WPPConnect session: ' + error.message);
    }
  }

  async getSessionCode(sessionName: string): Promise<string | null> {
    try {
      if (!this.code[sessionName]) {
        throw new Error('Session not found');
      }

      return this.code[sessionName];
    } catch (error) {
      throw new Error('Error fetching session code: ' + error.message);
    }
  }

  private async readSessionNames(): Promise<any[]> {
    try {
      const files = await fs.readdir(this.TOKEN_DIR);
      return files.filter(file => fs.stat(path.join(this.TOKEN_DIR, file)).then(stat => stat.isDirectory()));
    } catch (error) {
      console.error('Erro ao ler diretório de sessões:', error);
      return [];
    }
  }

  async reconnectAllSessions(): Promise<void> {
    const sessionNames = await this.readSessionNames();

    for (const session of sessionNames) {
      try {
        await this.startSession({ session_name: session });
      } catch (error) {
        console.error(`Erro ao reconectar sessão ${session}:`, error);
      }
    }

    console.log(`${this.sessions.size} sessões reconectadas com sucesso.`);
  }

  getSession(sessionName: string): SessionData | undefined {
    return this.sessions.get(sessionName);
  }

  getAllSessions(): Map<string, SessionData> {
    return this.sessions;
  }
}