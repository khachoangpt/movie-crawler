import  dotenv  from  'dotenv'

dotenv.config()

export const appConfig = {
  db: {
    DATABASE_CONNECTION: process.env.DATABASE_CONNECTION,
  },
  s3: {
    region: process.env.AWS_REGION || 'ap-southeast-1',
    bucket: process.env.AWS_S3_BUCKET || '',
    endpoint: process.env.AWS_S3_ENDPOINT,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
}