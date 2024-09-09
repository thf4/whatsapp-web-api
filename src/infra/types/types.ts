import { BucketLocationConstraint } from '@aws-sdk/client-s3';

export interface SessionToken {
  WABrowserId: string;
  WAToken1: string;
  WAToken2: string;
  WASecretBundle: string;
}

export interface TokenStore<T extends SessionToken = SessionToken> {
  /**
   * Return the session data if exists
   * @param sessionName Name of session
   */
  getToken(sessionName: string): Promise<T | undefined> | T | undefined;

  /**
   * Store the session token data
   * @param sessionName Name of session
   * @param tokenData Session token data
   */
  setToken(
    sessionName: string,
    tokenData: T | null
  ): Promise<boolean> | boolean;

  /**
   * Remove the session
   * @param sessionName Name of session
   * @returns Token was removed
   */
  removeToken(sessionName: string): Promise<boolean> | boolean;

  /**
   * A liste of avaliable sessions
   */
  listTokens(): Promise<string[]> | string[];
}


export interface ServerOptions {
  secretKey: string;
  host: string;
  port: number;
  deviceName: string;
  poweredBy: string;
  startAllSession: boolean;
  tokenStoreType: string;
  maxListeners: number;
  customUserDataDir: string;
  webhook: {
    url: string;
    autoDownload: boolean;
    uploadS3: boolean;
    readMessage: boolean;
    allUnreadOnStart: boolean;
    listenAcks: boolean;
    onPresenceChanged: boolean;
    onParticipantsChanged: boolean;
    onReactionMessage: boolean;
    onPollResponse: boolean;
    onRevokedMessage: boolean;
    onSelfMessage: boolean;
    ignore: string[];
  };
  websocket: {
    autoDownload: boolean;
    uploadS3: boolean;
  };
  archive: {
    enable: boolean;
    waitTime: number;
    daysToArchive: number;
  };
  log: {
    level: string;
    logger: string[];
  };
  createOptions: {
    browserArgs: string[];
  };
  mapper: {
    enable: boolean;
    prefix: string;
  };
  db: {
    mongodbDatabase: string;
    mongodbCollection: string;
    mongodbUser: string;
    mongodbPassword: string;
    mongodbHost: string;
    mongoIsRemote: boolean;
    mongoURLRemote: string;
    mongodbPort: number;
    redisHost: string;
    redisPort: number;
    redisPassword: string;
    redisDb: string;
    redisPrefix: string;
  };
  aws_s3: {
    region: BucketLocationConstraint | null;
    access_key_id: string | null;
    secret_key: string | null;
    defaultBucketName: string | null;
    endpoint?: string | null;
    forcePathStyle?: boolean | null;
  };
}

export interface Settings {
  path: any[];
  type: any;
  formatting?: (value: any, index?: number) => any;
  nested?: any;
  defaultValue?: any;
  required: boolean;
}

export interface Properties {
  path?: string;
  type?: string;
  formatting?: (value: any, index?: number) => any;
  nested?: any;
  required?: boolean;
  defaultValue?: any;
}

import { Whatsapp } from '@wppconnect-team/wppconnect';

export interface WhatsAppServer extends Whatsapp {
  urlcode: string;
  phone: string;
  status: string;
}
