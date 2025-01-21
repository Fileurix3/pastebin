import cookieParser from "cookie-parser";
import minioClient from "./databases/minio.js";
import postsRouter from "./services/posts/posts_router.js";
import usersRouter from "./services/users/users_router.js";
import redisClient from "./databases/redis.js";
import authRouter from "./services/auth/auth_router.js";
import sequelize from "./databases/db.js";
import express from "express";
import "dotenv/config";

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server was running on port: ${PORT}`));

export default app;
