import { CustomError, decodeJwt, handlerError } from "../index.js";
import { IPostModel, PostModel } from "../models/post_model.js";
import { Request, Response } from "express";
import { Stream } from "stream";
import mongoose, { Types } from "mongoose";
import minioClient from "../databases/minio.js";
import redisClient from "../databases/redis.js";

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

  public getPostById = async (req: Request, res: Response): Promise<void> => {
    const postId = req.params.postId;

    try {
      const cachedPost = await redisClient.get(`post:${postId}`);

      if (cachedPost) {
        const post = JSON.parse(cachedPost);
        const postBody = await this.getPostBodyFromMinio(
          post.post.bodyUrl.split(/\//).pop() as string
        );

        res.status(200).json({
          post: {
            name: post.post.name,
            body: postBody,
            createdAt: post.post.createdAt,
          },
          author: {
            name: post.author.name,
            avatar: post.author.avatar,
          },
        });

        return;
      }

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

      const postBody = await this.getPostBodyFromMinio(
        post.body.split(/\//).pop() as string
      );

      const cachingPost = {
        post: {
          name: post.name,
          bodyUrl: post.body,
          createdAt: post.createdAt,
        },
        author: {
          name: post.author.name,
          avatar: post.author.avatar,
        },
      };

      redisClient.setEx(`post:${postId}`, 3600, JSON.stringify(cachingPost));

      res.status(200).json({
        post: {
          name: post.name,
          body: postBody,
          createdAt: post.createdAt,
        },
        author: {
          name: post.author.name,
          avatar: post.author.avatar,
        },
      });
    } catch (err: unknown) {
      handlerError(err, res);
    }
  };

  private getPostBodyFromMinio(objectName: string): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
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
