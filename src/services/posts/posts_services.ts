import { CustomError, decodeJwt } from "../../index.js";
import { IPostModel, PostModel } from "../../models/post_model.js";
import { Stream } from "stream";
import mongoose, { Types } from "mongoose";
import minioClient from "../../databases/minio.js";
import redisClient from "../../databases/redis.js";

export class PostsServices {
  public async createPost(title: string, content: string, userToken: string) {
    if (!title || !content) {
      throw new CustomError("You have not filled in all the fields", 400);
    }

    const objectName: string = `${title
      .replace(/[^a-zA-Z0-9]/g, " ")
      .replace(/\s+/g, "-")}:${Date.now()}`;

    await minioClient.putObject("posts", objectName, content);

    const userId: string = decodeJwt(userToken).userId;

    const post: IPostModel = await PostModel.create({
      creatorId: userId,
      title: title,
      content: `http://${process.env.MINIO_END_POINT}:${process.env.MINIO_PORT}/posts/${objectName}`,
    });

    return {
      message: "Post was successfully created",
      post: post,
    };
  }

  public getPostById = async (postId: string) => {
    const cachedPost = await redisClient.get(`post:${postId}`);

    if (cachedPost) {
      const post = JSON.parse(cachedPost);
      const postBody = await this.getPostBodyFromMinio(
        post.post.contentUrl.split(/\//).pop() as string,
      );

      return {
        post: {
          title: post.post.title,
          content: postBody,
          createdAt: post.post.createdAt,
        },
        author: {
          name: post.author.name,
          avatar: post.author.avatar,
        },
      };
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
      post.content.split(/\//).pop() as string,
    );

    const cachingPost = {
      post: {
        title: post.title,
        contentUrl: post.content,
        createdAt: post.createdAt,
      },
      author: {
        name: post.author.name,
        avatar: post.author.avatar,
      },
    };

    redisClient.setEx(`post:${postId}`, 3600, JSON.stringify(cachingPost));

    return {
      post: {
        title: post.title,
        content: postBody,
        createdAt: post.createdAt,
      },
      author: {
        name: post.author.name,
        avatar: post.author.avatar,
      },
    };
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

  public async searchPost(searchParams: string) {
    const posts: IPostModel[] = await PostModel.find({
      title: { $regex: searchParams, $options: "i" },
    });

    return posts;
  }

  public async updatePost(
    newTitle: string | null,
    newContent: string | null,
    postId: string,
    userToken: string,
  ) {
    if (!newTitle && !newContent) {
      throw new CustomError("You have to change at least one thing", 400);
    }

    const post: IPostModel | null = await PostModel.findById(postId);
    const userId = decodeJwt(userToken).userId;

    if (post == null) {
      throw new CustomError("Post not found", 404);
    } else if (userId != String(post.creatorId)) {
      throw new CustomError("Only the creator edit this post", 403);
    }

    if (newTitle) {
      await PostModel.updateOne({ _id: postId }, { title: newTitle });
    }

    if (newContent) {
      const objectName = post.content.split(/\//).pop();
      await minioClient.putObject("posts", objectName!, newContent);
    }

    return {
      message: "Post was successfully updated",
    };
  }

  public async deletePost(userToken: string, postId: string) {
    const post: IPostModel | null = await PostModel.findById(postId);
    const userId = decodeJwt(userToken).userId;

    if (post == null) {
      throw new CustomError("Post not found", 404);
    } else if (userId != String(post.creatorId)) {
      throw new CustomError("Only the creator delete this post", 403);
    }

    const minioObjectName = post.content.split(/\//).pop();

    if (!minioObjectName) {
      throw new CustomError("Object not found", 404);
    }

    await minioClient.removeObject("posts", minioObjectName!).catch((err) => {
      throw new Error(`Error when delete a post: ${err}`);
    });

    await PostModel.deleteOne({
      _id: new Types.ObjectId(postId),
    });

    return {
      message: "The post was successfully deleted",
    };
  }
}
