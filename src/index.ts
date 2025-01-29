import cookieParser from "cookie-parser";
import minioClient from "./databases/minio";
import postsRouter from "./services/posts/posts_router";
import usersRouter from "./services/users/users_router";
import redisClient from "./databases/redis";
import authRouter from "./services/auth/auth_router";
import sequelize from "./databases/db";
import express from "express";
import "dotenv/config";
import { errorMiddleware } from "./middleware/error_middleware";

const app = express();

sequelize
  .authenticate()
  .then(() => console.log("Connection to Postgres was successful"))
  .catch((err: unknown) => console.log(`Postgres error: ` + err));

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
app.use("/user", usersRouter);

app.use(errorMiddleware);

if (process.env.NODE_ENV != "test") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server was running on port: ${PORT}`));
}

export default app;
