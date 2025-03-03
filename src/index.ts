import { errorMiddleware } from "./middleware/error_middleware";
import { PostsController } from "./services/posts/posts_controller";
import { AuthController } from "./services/auth/auth_controller";
import { UsersController } from "./services/users/users_controller";
import { S3Service } from "./services/s3/s3_service";
import cookieParser from "cookie-parser";
import redisClient from "./databases/redis";
import swaggerUi from "swagger-ui-express";
import sequelize from "./databases/db";
import express from "express";
import yaml from "yamljs";
import path from "path";
import "dotenv/config";

const app = express();
const swaggerDocument = yaml.load(path.join(__dirname, "../swagger.yaml"));
const s3Service = new S3Service();

sequelize
  .authenticate()
  .then(() => console.log("Connection to Postgres was successful"))
  .catch((err: unknown) => console.log(`Postgres error: ` + err));

redisClient
  .connect()
  .then(() => console.log("Connected to Redis was successfully"))
  .catch((err: unknown) => console.log("Redis error: " + err));

s3Service.checkConnectAndCreateBucket();

app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const authController = new AuthController();
app.use("/auth", authController.router);

const postsController = new PostsController();
app.use("/post", postsController.router);

const usersController = new UsersController();
app.use("/user", usersController.router);

app.use(errorMiddleware);

if (process.env.NODE_ENV != "test") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server was running on port: ${PORT}`);
    console.log(`Documentation in swagger: localhost:${PORT}/api-docs`);
  });
}

export default app;
