import { BadRequestException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { create, SocketState, Whatsapp } from '@wppconnect-team/wppconnect';
import { Request } from 'express';

import { WhatsAppServer } from '../types/types';
import { TokenStoreFactory } from '../utils/tokenStoreFactory';
import EventEmitter from 'events';
import { UtilsService } from './functions';
import { ConfigService } from '@nestjs/config';
import configuration from '../config/configuration';
import { mapWppConnectToCallback } from '../utils/mapper/onmessage.mapper';


export let clientsArray: Whatsapp[] = [];
export let clientsCode: any[] = [];
export const sessions = [];
export const eventEmitter = new EventEmitter();

@Injectable()
export class SessionService implements OnModuleInit {
  private readonly logger = new Logger(SessionService.name);
  constructor(
    private readonly utilsService: UtilsService,
    private readonly tokenStoreFactory: TokenStoreFactory,
    private configService: ConfigService
  ) { };

  async onModuleInit() {
    const allSessions = await this.getAllTokens();
    allSessions.map(async (session: string) => await this.opendata({}, session));
  }

  async createSessionUtil(
    payload: any,
    clientsArray: any,
    session: string,
    res?: any
  ) {
    try {
      let client = this.getClient(session) as any;
      if (client.status != null && client.status !== 'CLOSED') return;
      client.status = 'INITIALIZING';
      client.config = payload;

      const tokenStore = this.tokenStoreFactory;
      const myTokenStore = tokenStore.createTokenStore(client);
      const tokenData = await myTokenStore.getToken(session);

      if (!tokenData) {
        myTokenStore.setToken(session, tokenData ?? client.config);
      }

      if (!client?.config?.webhook && tokenData) {
        client.config = tokenData;
      }

      const wppClient = await create(Object.assign(
        {},
        { tokenStore: myTokenStore },
        {},
        {
          folderNameToken: 'userDataDir',
          session: session,
          logQR: false,
          phoneNumber: client.config.phone_number ?? null,
          browserArgs: configuration().createOptions.browserArgs,
          deviceName:
            client.config.phone_number == undefined
              ? client.config?.deviceName ||
              'Smartime.AI'
              : undefined,
          poweredBy:
            client.config.phone_number == undefined
              ? client.config?.poweredBy ||
              'Smartime.AI-Server'
              : undefined,
          catchLinkCode: (code: string) => {
            this.exportPhoneCode(client.config.phone_number, code, client, res);
          },
          catchQR: (base64Qr: any, asciiQR: any, attempt: any, urlCode: any) => {
            this.exportQR(base64Qr, urlCode, client, res);
          },
          statusFind: async (statusFind: string) => {
            try {
              eventEmitter.emit(`status-${client.session}`, client, statusFind);
              if (
                statusFind === 'autocloseCalled' ||
                statusFind === 'desconnectedMobile'
              ) {
                client.status = 'CLOSED';
                client.qrcode = null;
                client.phoneCode = null;
                await client.close();
                clientsArray[session] = undefined;
              }
              await this.utilsService.callWebHook(client, 'status-find', {
                status: statusFind,
                session: client.session,
              });
              this.logger.log(statusFind + '\n\n');
            } catch (error) {
              this.logger.error(error);
            }
          },
        })).catch(error => { throw error; });

      client = clientsArray[session] = Object.assign(wppClient, client);
      await this.start(payload, client);

      if (configuration().webhook.onParticipantsChanged) {
        await this.onParticipantsChanged(client);
      }

      if (configuration().webhook.onReactionMessage) {
        await this.onReactionMessage(client);
      }

      if (configuration().webhook.onRevokedMessage) {
        await this.onRevokedMessage(client);
      }

      if (configuration().webhook.onPollResponse) {
        await this.onPollResponse(client);
      }

      if (configuration().webhook.onLabelUpdated) {
        await this.onLabelUpdated(client);
      }
      return;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async opendata(payload: any, session: string, res?: any) {
    await this.createSessionUtil(payload, clientsArray, session, res);
  }

  exportPhoneCode(
    phone: any,
    phoneCode: any,
    client: WhatsAppServer,
    res?: any
  ) {
    eventEmitter.emit(`phoneCode-${client.session}`, phoneCode, client);

    Object.assign(client, {
      status: 'PHONECODE',
      phoneCode: phoneCode,
      phone: phone,
    });

    clientsCode.push({
      session: client.session,
      status: 'PHONECODE',
      phoneCode: phoneCode,
      phone: phone,
    });

    this.utilsService.callWebHook(client, 'phoneCode', {
      phoneCode: phoneCode,
      phone: phone,
      session: client.session,
    });

    if (res && !res.headersSent) {
      res.status(200).json({
        session: client.session,
        status: 'PHONECODE',
        phoneCode: phoneCode,
        phone: phone,
      });
    }

    return phoneCode
  }

  exportQR(
    qrCode: any,
    urlCode: any,
    client: WhatsAppServer,
    res?: any
  ) {
    eventEmitter.emit(`qrcode-${client.session}`, qrCode, urlCode, client);
    Object.assign(client, {
      status: 'QRCODE',
      qrcode: qrCode,
      urlcode: urlCode,
    });

    qrCode = qrCode.replace('data:image/png;base64,', '');

    this.utilsService.callWebHook(client, 'qrcode', {
      qrcode: qrCode,
      urlcode: urlCode,
      session: client.session,
    });

    if (res && !res.headersSent) {
      res.status(200).json({
        status: 'QRCODE',
        qrcode: qrCode,
        urlcode: urlCode,
      });
    }

    return qrCode;
  }

  async onParticipantsChanged(client: any) {
    await client.isConnected();
    await client.onParticipantsChanged((message: any) => {
      this.utilsService.callWebHook(client, 'onparticipantschanged', message);
    });
  }

  async start(req: Request, client: WhatsAppServer) {
    try {
      await client.isConnected();
      Object.assign(client, { status: 'CONNECTED', qrcode: null, code: null });

      this.logger.log(`Started Session: ${client.session}`);
      await this.utilsService.startHelper(client);
    } catch (error) {
      this.logger.error(error);
    }

    await this.checkStateSession(client);
    await this.listenMessages(client);
    return;
  }

  async checkStateSession(client: WhatsAppServer) {
    client.onStateChange((state: SocketState) => {
      this.logger.log(`State Change ${state}: ${client.session}`);
      const conflicts = [SocketState.CONFLICT];

      if (conflicts.includes(state)) {
        client.useHere();
      }
    });
  }

  async listenMessages(client: WhatsAppServer) {
    client.onMessage(async (message: any) => {
      eventEmitter.emit(`mensagem-${client.session}`, client, message);
      const mappedMessage = mapWppConnectToCallback(message);
      await this.utilsService.callWebHook(client, 'onmessage', mappedMessage);
      if (message.type === 'location') {
        client.onLiveLocation(message.sender.id, (location: any) => {
          this.utilsService.callWebHook(client, 'location', location);
        });
      }
    });

    client.onIncomingCall(async (call: any) => {
      await this.utilsService.callWebHook(client, 'incomingcall', call);
    });
  }

  async listenAcks(client: WhatsAppServer) {
    client.onAck(async (ack: any) => {
      await this.utilsService.callWebHook(client, 'onack', ack);
    });
  }

  async onPresenceChanged(client: WhatsAppServer) {
    client.onPresenceChanged(async (presenceChangedEvent: any) => {
      await this.utilsService.callWebHook(client, 'onpresencechanged', presenceChangedEvent);
    });
  }

  async onReactionMessage(client: WhatsAppServer) {
    await client.isConnected();
    client.onReactionMessage(async (reaction: any) => {
      await this.utilsService.callWebHook(client, 'onreactionmessage', reaction);
    });
  }

  async onRevokedMessage(client: WhatsAppServer) {
    await client.isConnected();
    client.onRevokedMessage(async (response: any) => {
      await this.utilsService.callWebHook(client, 'onrevokedmessage', response);
    });
  }

  async onPollResponse(client: WhatsAppServer) {
    await client.isConnected();
    client.onPollResponse(async (response: any) => {
      await this.utilsService.callWebHook(client, 'onpollresponse', response);
    });
  }

  async onLabelUpdated(client: WhatsAppServer) {
    await client.isConnected();
    client.onUpdateLabel(async (response: any) => {
      await this.utilsService.callWebHook(client, 'onupdatelabel', response);
    });
  }

  encodeFunction(data: any, webhook: any) {
    data.webhook = webhook;
    return JSON.stringify(data);
  }

  decodeFunction(text: any, client: any) {
    const object = JSON.parse(text);
    if (object.webhook && !client.webhook) {
      client.webhook = object.webhook;
    }
    delete object.webhook;
    return object;
  }

  getClient(session: any) {
    let client = clientsArray[session];

    if (!client) {
      client = clientsArray[session] = {
        status: null,
        session: session,
      } as any;
    }
    return client;
  }
  async getAllTokens() {
    const tokenStore = this.tokenStoreFactory;
    const myTokenStore = tokenStore.createTokenStore(null);
    try {
      return await myTokenStore.listTokens();
    } catch (e) {
      this.logger.error(e);
    }
  }

  async getSessionCode(session: string) {
    const token = this.getClient(session) as any;

    if (token && !token.code) {
      return token?.status
    }

    if (!token.code) {
      throw new BadRequestException(`Session code not exists for this session : ${session}`)
    }
    return token.code;
  }
}
