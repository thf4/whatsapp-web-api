import { HeadBucketCommand, S3Client } from '@aws-sdk/client-s3';
import configuration from '../../config/configuration';

import { createLogger } from '../logger';

export async function bucketAlreadyExists(bucketName: string) {
  const logger = createLogger({ level: 'info' });
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      if (!configuration().aws_s3.region) throw new Error('Config your AWS environment');
      const s3Client = new S3Client({ region: configuration().aws_s3.region });

      const command = new HeadBucketCommand({ Bucket: bucketName });
      await s3Client.send(command);
      resolve(true);
    } catch (error: any) {
      if (error.name === 'NoSuchBucket' || error.name === 'NotFound') {
        resolve(false);
      } else {
        logger.error(error);
        reject(error);
      }
    }
  });
}
