import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { customAlphabet } from 'nanoid';
import { config } from 'dotenv';

config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const generateCustomId = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 10);

export const s3Upload = async (file: Express.Multer.File) => {
  const id = generateCustomId();
  const key = `uploads/${id}-${file.originalname}`;

  const upload = new Upload({
    client: s3,
    params: {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    },
  });

  const result = await upload.done();
  console.log(result);
  
  return (result as any).Location || `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};
