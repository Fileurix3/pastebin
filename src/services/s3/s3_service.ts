import {
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  ListBucketsCommand,
  PutBucketPolicyCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Readable } from "stream";

export class S3Service {
  private s3Client: S3Client;
  private BUCKET_NAME: string = "posts";

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.MINIO_REGION,
      endpoint: `http://${process.env.MINIO_END_POINT}:${process.env.MINIO_PORT}`,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY!.toString(),
        secretAccessKey: process.env.MINIO_SECRET_KEY!.toString(),
      },
    });
  }

  async putObject(objectName: string, content: string) {
    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.BUCKET_NAME,
          Key: objectName,
          Body: content,
        }),
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(`Error uploading object "${objectName}":`, err.message);
      } else {
        console.error("Unknown error:", err);
      }
    }
  }

  async getObject(objectName: string): Promise<string | undefined> {
    try {
      const response = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.BUCKET_NAME,
          Key: objectName,
        }),
      );

      const streamToString = (stream: Readable): Promise<string> => {
        return new Promise(async (resolve, reject) => {
          const chunks: Buffer[] = [];
          stream.on("data", (chunk) => chunks.push(chunk));
          stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
          stream.on("error", reject);
        });
      };

      return streamToString(response.Body as Readable);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(`Error uploading object "${objectName}":`, err.message);
      } else {
        console.error("Unknown error:", err);
      }
    }
  }

  async removeObject(objectName: string): Promise<void> {
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.BUCKET_NAME,
          Key: objectName,
        }),
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(`Error uploading object "${objectName}":`, err.message);
      } else {
        console.error("Unknown error:", err);
      }
    }
  }

  async checkConnectAndCreateBucket() {
    try {
      const { Buckets } = await this.s3Client.send(new ListBucketsCommand({}));
      console.log("Connected to Minio was successfully");

      const recipeBucketExists = Buckets?.some(
        (bucket) => bucket.Name === this.BUCKET_NAME,
      );

      if (!recipeBucketExists) {
        await this.s3Client.send(
          new CreateBucketCommand({
            Bucket: this.BUCKET_NAME,
          }),
        );

        await this.s3Client.send(
          new PutBucketPolicyCommand({
            Bucket: this.BUCKET_NAME,
            Policy: JSON.stringify({
              Version: "2012-10-17",
              Statement: [
                {
                  Effect: "Allow",
                  Principal: "*",
                  Action: "s3:GetObject",
                  Resource: `arn:aws:s3:::${this.BUCKET_NAME}/*`,
                },
              ],
            }),
          }),
        );

        console.log(`bucket "${this.BUCKET_NAME}" was successfully created`);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Creation Error bucket:", err.message);
      } else {
        console.error("Unknown error:", err);
      }
    }
  }
}
