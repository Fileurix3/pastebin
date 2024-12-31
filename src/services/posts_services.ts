import { CustomError, decodeJwt, handlerError } from "../index.js";
import { IPostModel, PostModel } from "../models/post_model.js";
import { Request, Response } from "express";
import { Stream } from "stream";
import minioClient from "../databases/minio.js";
import mongoose, { Types } from "mongoose";

export class PostsServices {
  public async createPost(req: Request, res: Response): Promise<void> {
    const userToken = req.cookies.token;
    const { name, body } = req.body;

    try {
      if (!name || !body) {
        throw new CustomError("You have not filled in all the fields", 400);
      }

      const objectName: string = `${name
        .replace(/[^a-zA-Z0-9]/g, " ")
        .replace(/\s+/g, "-")}:${Date.now()}`;

      await minioClient.putObject("posts", objectName, body);

      const userId: string = decodeJwt(userToken).userId;

      await PostModel.create({
        creatorId: userId,
        name: name,
        body: `http://${process.env.MINIO_END_POINT}:${process.env.MINIO_PORT}/posts/${objectName}`,
      });

      res.status(201).json({
        message: "Post was successfully created",
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

      const postBody: Promise<string> = new Promise<string>(async (resolve, reject) => {
        const objectName: string = post.body.split(/\//).pop() as string;

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
          body: await postBody,
        },
        author: {
          name: post.author.name,
        },
      });
    } catch (err: unknown) {
      handlerError(err, res);
    }
  }

  public async searchPost(req: Request, res: Response): Promise<void> {
    const searchParams = req.params.params;

    try {
      const posts: IPostModel[] = await PostModel.find({
        name: { $regex: searchParams, $options: "i" },
      });

      res.status(200).json({
        posts,
      });
    } catch (err: unknown) {
      handlerError(err, res);
    }
  }

  public async updatePost(req: Request, res: Response): Promise<void> {
    const userToken = req.cookies.token;
    const postId = req.params.postId;
    const { newName, newBody } = req.body;

    try {
      if (!newName && !newBody) {
        throw new CustomError("You have to change at least one thing", 400);
      }

      const post: IPostModel | null = await PostModel.findById(postId);

      const userId = decodeJwt(userToken).userId;

      if (post == null) {
        throw new CustomError("Post not found", 404);
      } else if (userId != String(post.creatorId)) {
        throw new CustomError("Only the creator edit this post", 403);
      }

      if (newName) {
        await PostModel.updateOne({ _id: postId }, { name: newName });
      }

      if (newBody) {
        const objectName = post.body.split(/\//).pop();
        await minioClient.putObject("posts", objectName!, newBody);
      }

      res.status(200).json({
        message: "Post was successfully updated",
      });
    } catch (err: unknown) {
      handlerError(err, res);
    }
  }

  public async deletePost(req: Request, res: Response): Promise<void> {
    const userToken = req.cookies.token;
    const postId = req.params.postId;

    try {
      const post: IPostModel | null = await PostModel.findById(postId);
      const userId: string = decodeJwt(userToken).userId;

      if (post == null) {
        throw new CustomError("Post not found", 404);
      } else if (String(post.creatorId) != userId) {
        throw new CustomError("Only the creator delete this post", 403);
      }

      const minioObjectName = post.body.split(/\//).pop();

      if (!minioObjectName) {
        throw new CustomError("Object not found", 404);
      }

      await minioClient.removeObject("posts", minioObjectName!).catch((err) => {
        throw new Error(`Error when delete a post: ${err}`);
      });

      await PostModel.deleteOne({
        _id: new Types.ObjectId(postId),
      });

      res.status(200).json({
        message: "The post was successfully deleted",
      });
    } catch (err: unknown) {
      handlerError(err, res);
    }
  }
}
