import { Response } from "express";
import cookieParser from "cookie-parser";
import express from "express";
import mongo from "mongoose";
import jwt from "jsonwebtoken";
import minioClient from "./databases/minio.js";
import authRouter from "./router/auth_router.js";
import postsRouter from "./router/posts_router.js";
import userRouter from "./router/user_router.js";
import "dotenv/config";
import redisClient from "./databases/redis.js";

const app = express();

mongo
  .connect(process.env.MONGO_URL as string)
  .then(() => console.log("Connection to Mongo was successful"))
  .catch((err: unknown) => console.log(`Mongo error: ` + err));

redisClient
  .connect()
  .then(() => console.log("Connected to Redis was successfully"))
  .catch((err: unknown) => console.log("Redis error: " + err));

minioClient
  .listBuckets()
  .then(() => console.log("Connected to Minio was successfully"))
  .catch((err: unknown) => console.log("Minio error: " + err));

app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use("/auth", authRouter);
app.use("/post", postsRouter);
app.use("/user", userRouter);

export class CustomError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function handlerError(err: unknown, res: Response): Response {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      message: err.message,
    });
  } else {
    console.error(err);
    return res.status(500).json({
      message: (err as Error).message || "Unknown error",
    });
  }
}

export function decodeJwt(token: string): Record<string, string> {
  jwt.verify(token, process.env.JWT_SECRET as string, (err: unknown) => {
    if (err) {
      throw new CustomError("Invalid token", 403);
    }
  });

  const decodeToken = jwt.decode(token);
  return decodeToken as Record<string, string>;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server was running on port: ${PORT}`));

export default app;
