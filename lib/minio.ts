import { Client } from "minio";

export const MINIO_BUCKET = process.env.MINIO_BUCKET || "portfolio-images";

export const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || "localhost",
  port: Number(process.env.MINIO_PORT) || 9000,
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

export async function ensureBucket() {
  const exists = await minioClient.bucketExists(MINIO_BUCKET).catch(() => false);
  if (!exists) {
    await minioClient.makeBucket(MINIO_BUCKET);
  }
}

export async function getPresignedPutUrl(objectKey: string, expirySeconds = 300) {
  await ensureBucket();
  return minioClient.presignedPutObject(MINIO_BUCKET, objectKey, expirySeconds);
}

export async function getObjectBuffer(objectKey: string) {
  const stream = await minioClient.getObject(MINIO_BUCKET, objectKey);
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks);
}

export async function getObjectStream(objectKey: string) {
  return minioClient.getObject(MINIO_BUCKET, objectKey);
}

export async function putObjectBuffer(objectKey: string, buffer: Buffer, contentType: string) {
  await ensureBucket();
  await minioClient.putObject(MINIO_BUCKET, objectKey, buffer, buffer.length, {
    "Content-Type": contentType,
  });
}

export async function statObject(objectKey: string) {
  return minioClient.statObject(MINIO_BUCKET, objectKey);
}
