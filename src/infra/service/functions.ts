import {
  Injectable,
  Logger,
} from '@nestjs/common';
import {
  CreateBucketCommand,
  PutObjectCommand,
  PutPublicAccessBlockCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import axios from 'axios';
import * as Crypto from 'crypto';
import * as mimetypes from 'mime-types';

import { convert } from '../utils/mapper';
import { bucketAlreadyExists } from '../utils/bucket/bucket';
import configuration from '../config/configuration';

const config = configuration();

@Injectable()
export class UtilsService {
  private readonly logger = new Logger(UtilsService.name);

  constructor() { }

  contactToArray(number: string | string[], isGroup = false, isNewsletter = false): string[] {
    const localArr: string[] = [];
    if (Array.isArray(number)) {
      for (let contact of number) {
        contact = this.formatContact(contact, isGroup, isNewsletter);
        if (contact) localArr.push(contact);
      }
    } else {
      const arrContacts = number.split(/\s*[,;]\s*/g);
      for (let contact of arrContacts) {
        contact = this.formatContact(contact, isGroup, isNewsletter);
        if (contact) localArr.push(contact);
      }
    }
    return localArr;
  }

  groupToArray(group: string | string[]): string[] {
    return this.contactToArray(group, true);
  }

  groupNameToArray(group: string | string[]): string[] {
    const localArr: string[] = [];
    if (Array.isArray(group)) {
      for (const contact of group) {
        if (contact) localArr.push(contact);
      }
    } else {
      const arrContacts = group.split(/\s*[,;]\s*/g);
      for (const contact of arrContacts) {
        if (contact) localArr.push(contact);
      }
    }
    return localArr;
  }

  async callWebHook(client: any, event: any, data: any) {
    const webhook = client?.config.webhook || false;
    if (webhook) {
      if (this.shouldIgnoreWebhook(event, data)) return;
      if (config.webhook.autoDownload) await this.autoDownload(client, data);

      try {
        const chatId = data.from || data.chatId || (data.chatId ? data.chatId._serialized : null);
        data = { event, session: client.session, ...data };
        if (config.mapper.enable) data = await convert(config.mapper.prefix, data);

        await axios.post(webhook, data);

        if (this.shouldMarkAsRead(event)) {
          client.sendSeen(chatId);
        }
      } catch (e) {
        this.logger.warn('Error calling Webhook.', e);
      }
    }
  }

  async startHelper(client: any) {
    await this.sendUnread(client);
  }

  async autoDownload(client: any, message: any) {
    try {
      if (message?.mimetype || message.isMedia || message.isMMS) {
        const buffer = await client.decryptFile(message);

        if (config.aws_s3?.enabled) {
          const hashName = Crypto.randomBytes(24).toString('hex');
          const s3Client = new S3Client({
            region: config.aws_s3.region,
            endpoint: config.aws_s3.endpoint,
          });

          let bucketName = config.aws_s3.defaultBucketName || client.session;
          bucketName = this.normalizeBucketName(bucketName);

          const fileName = `${config.aws_s3.defaultBucketName ? client.session + '/' : ''}${hashName}.${mimetypes.extension(message.mimetype)}`;

          if (!config.aws_s3.defaultBucketName && !(await bucketAlreadyExists(bucketName))) {
            await this.createS3Bucket(s3Client, bucketName);
          }

          await s3Client.send(
            new PutObjectCommand({
              Bucket: bucketName,
              Key: fileName,
              Body: buffer,
              ContentType: message.mimetype,
              ACL: 'public-read',
            })
          );

          message.fileUrl = `https://${bucketName}.s3.amazonaws.com/${fileName}`;
        } else {
          message.body = buffer.toString('base64');
        }
      }
    } catch (e) {
      this.logger.error(e);
    }
  }

  async startAllSessions() {
    try {
      await axios.post(`${config.host}:${config.port}/auth/start-all`);
    } catch (e) {
      this.logger.error(e);
    }
  }

  // Additional utility methods for private usage
  private formatContact(contact: string, isGroup: boolean, isNewsletter: boolean): string | null {
    contact = isGroup || isNewsletter ? contact.split('@')[0] : contact.split('@')[0]?.replace(/[^\w ]/g, '');
    if (!contact) return null;
    return isGroup ? `${contact}@g.us` : isNewsletter ? `${contact}@newsletter` : `${contact}@c.us`;
  }

  private shouldIgnoreWebhook(event: string, data: any): boolean {
    return config.webhook.ignore.includes(event) || config.webhook.ignore.includes(data.from) || config.webhook.ignore.includes(data.type);
  }

  private shouldMarkAsRead(event: string): boolean {
    const events = ['unreadmessages', 'onmessage'];
    return events.includes(event) && config.webhook.readMessage;
  }

  private normalizeBucketName(bucketName: string): string {
    bucketName = bucketName.normalize('NFD').replace(/[\u0300-\u036f]|[— _.,?!]/g, '').toLowerCase();
    return bucketName.length < 3 ? `${bucketName}${Math.floor(Math.random() * 900) + 100}` : bucketName;
  }

  private async createS3Bucket(s3Client: S3Client, bucketName: string) {
    await s3Client.send(new CreateBucketCommand({ Bucket: bucketName, ObjectOwnership: 'ObjectWriter' }));
    await s3Client.send(
      new PutPublicAccessBlockCommand({
        Bucket: bucketName,
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: false,
          IgnorePublicAcls: false,
          BlockPublicPolicy: false,
        },
      })
    );
  }

  private async sendUnread(client: any) {
    this.logger.log(`${client.session} : Inicio enviar mensagens não lidas`);

    try {
      const chats = await client.getAllChatsWithMessages(true);

      if (chats && chats.length > 0) {
        for (let i = 0; i < chats.length; i++)
          for (let j = 0; j < chats[i].msgs.length; j++) {
            this.callWebHook(client, 'unreadmessages', chats[i].msgs[j]);
          }
      }

      this.logger.log(`${client.session} : Fim enviar mensagens não lidas`);
    } catch (ex) {
      this.logger.error(ex);
    }
  }
}
