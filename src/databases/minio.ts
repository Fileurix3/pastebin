import * as Minio from "minio";
import "dotenv/config";

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_END_POINT as string,
  port: parseInt(process.env.MINIO_PORT as string, 10),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY as string,
  secretKey: process.env.MINIO_SECRET_KEY as string,
});

async function createBucket() {
  const exists = await minioClient.bucketExists("posts");

  if (!exists) {
    await minioClient.makeBucket("posts", "us-east-1");

    const policy = `{
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Principal": "*",
          "Action": "s3:GetObject",
          "Resource": "arn:aws:s3:::${process.env.MINIO_POSTS_BUCKET_NAME}/*"
        }
      ]
    }`;

    await minioClient.setBucketPolicy("posts", policy);
    console.log("Bucket of posts has been successfully created");
  }
}

await createBucket();

export default minioClient;
