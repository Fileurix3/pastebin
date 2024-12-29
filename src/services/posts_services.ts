import { Request, Response } from "express";
import { CustomError, decodeJwt, handlerError } from "../index.js";
import { Stream } from "stream";
import minioClient from "../databases/minio.js";
import { IPostModel, PostModel } from "../models/post_model.js";

export class PostsServices {
  public async createPost(req: Request, res: Response): Promise<void> {
    const userToken = req.cookies.token;
    const { name, text } = req.body;

    try {
      if (!name || !text) {
        throw new CustomError("You have not filled in all the fields", 400);
      }

      const objectName: string = `${name}:${Date.now()}`;
      await minioClient.putObject("posts", objectName, text);

      const userId: string = decodeJwt(userToken).userId;

      const createPost: IPostModel = await PostModel.create({
        creatorId: userId,
        name: name,
        text: `http://${process.env.MINIO_END_POINT}:${process.env.MINIO_PORT}/posts/${objectName}`,
      });

      res.status(201).json({
        message: "Post was successfully created",
        post: createPost,
      });
    } catch (err: unknown) {
      handlerError(err, res);
    }
  }

  public async getPost(req: Request, res: Response): Promise<void> {
    const postId = req.params.postId;
    try {
      /*
      const objectData = new Promise<string>(async (resolve, reject) => {
        const minioObject: Stream = await minioClient.getObject("posts", name);

        let data = "";

        minioObject.on("data", (chunk) => {
          data += chunk;
        });

        minioObject.on("end", () => {
          resolve(data);
        });

        minioObject.on("error", (err) => {
          reject(err);
        });
      });
      */
    } catch (err: unknown) {
      handlerError(err, res);
    }
  }
}
