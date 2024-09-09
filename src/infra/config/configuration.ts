export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  },
  cache: {
    ttl: parseInt(process.env.CACHE_TTL) || 120000,
  },
  aws_s3: {
    region: process.env.AWS_REGION,
    enabled: process.env.AWS_ENABLED,
    endpoint: process.env.AWS_ENDPOINT,
    defaultBucketName: process.env.BUCKET_NAME,
  },
  token_store: {
    type: process.env.TOKEN_STORE_TYPE
  },
  mapper: {
    enable: process.env.MAPPER_ENABLED,
    prefix: process.env.MAPPER_PREFIX
  },
  secretKey: 'THISISMYSECURETOKEN',
  host: 'http://localhost',
  webhook: {
    ignore: ['status@broadcast'],
    url: null,
    autoDownload: false,
    uploadS3: false,
    readMessage: false,
    allUnreadOnStart: true,
    listenAcks: false,
    onPresenceChanged: false,
    onParticipantsChanged: false,
    onReactionMessage: false,
    onPollResponse: false,
    onRevokedMessage: false,
    onLabelUpdated: false,
    onSelfMessage: false,
  },
  createOptions: {
    browserArgs: [
      '--disable-web-security',
      '--no-sandbox',
      '--disable-web-security',
      '--aggressive-cache-discard',
      '--disable-cache',
      '--disable-application-cache',
      '--disable-offline-load-stale-cache',
      '--disk-cache-size=0',
      '--disable-background-networking',
      '--disable-default-apps',
      '--disable-extensions',
      '--disable-sync',
      '--disable-translate',
      '--hide-scrollbars',
      '--metrics-recording-only',
      '--mute-audio',
      '--no-first-run',
      '--safebrowsing-disable-auto-update',
      '--ignore-certificate-errors',
      '--ignore-ssl-errors',
      '--ignore-certificate-errors-spki-list',
    ],
  }
});
