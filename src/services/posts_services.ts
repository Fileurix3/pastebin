import { CustomError, decodeJwt, handlerError } from "../index.js";
import { IPostModel, PostModel } from "../models/post_model.js";
import { Request, Response } from "express";
import { Stream } from "stream";
import minioClient from "../databases/minio.js";
import mongoose from "mongoose";

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

  public async getPostById(req: Request, res: Response): Promise<void> {
    const postId = req.params.postId;

    try {
      const postResult = await PostModel.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(postId),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "creatorId",
            foreignField: "_id",
            as: "author",
          },
        },
        {
          $unwind: "$author",
        },
      ]);

      const post = postResult[0];

      if (post == null) {
        throw new CustomError("Post not found", 404);
      }

      const postText: Promise<string> = new Promise<string>(async (resolve, reject) => {
        const objectName: string = post.text.split(/\//).pop() as string;

        const minioObject: Stream = await minioClient.getObject("posts", objectName);

        let data: string = "";

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

      res.status(200).json({
        post: {
          name: post.name,
          body: await postText,
        },
        author: {
          name: post.author.name,
        },
      });
    } catch (err: unknown) {
      handlerError(err, res);
    }
  }
}
