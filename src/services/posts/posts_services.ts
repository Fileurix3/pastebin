import { CustomError, decodeJwt } from "../../utils/utils";
import { UserLikesModel } from "../../models/users_likes_model";
import { PostModel } from "../../models/post_model";
import { S3Service } from "../s3/s3_service";
import { UserModel } from "../../models/user_model";
import { Stream } from "stream";
import { Op } from "@sequelize/core";
//import minioClient from "../../databases/minio";
import redisClient from "../../databases/redis";

export class PostsServices {
  private s3Client: S3Service = new S3Service();

  public async createPost(title: string, content: string, userToken: string) {
    if (!title) {
      throw new CustomError("Title is required", 400);
    } else if (!content) {
      throw new CustomError("Content is required", 400);
    }

    const objectName: string = `${title
      .replace(/[^a-zA-Z0-9]/g, " ")
      .replace(/\s+/g, "-")}:${Date.now()}`;

    await this.s3Client.putObject(objectName, content);

    const userId: string = decodeJwt(userToken).userId;

    const post: PostModel = await PostModel.create({
      creator_id: userId,
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
      const postContent = await this.s3Client.getObject(
        post.content.split(/\//).pop() as string,
      );

      post.content = postContent;
      return post;
    }

    const countLikes = await UserLikesModel.count({
      where: {
        post_id: postId,
      },
    });

    const post: Record<string, any> | null = await PostModel.findOne({
      where: {
        id: postId,
      },
      include: [
        {
          model: UserModel,
          as: "creator",
          attributes: ["id", "name", "avatar_url"],
          required: true,
        },
      ],
    });

    if (post == null) {
      throw new CustomError("Post not found", 404);
    }

    const postObj = post.get();
    postObj.countLikes = countLikes;

    redisClient.setEx(`post:${postId}`, 3600, JSON.stringify(post));

    const postContent = await this.s3Client.getObject(
      post.content.split(/\//).pop() as string,
    );

    post.content = postContent;
    return post;
  };

  public async searchPost(searchParams: string) {
    const posts: PostModel[] = await PostModel.findAll({
      where: {
        title: { [Op.like]: searchParams },
      },
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

    const post: PostModel | null = await PostModel.findOne({
      where: {
        id: postId,
      },
    });

    const userId = decodeJwt(userToken).userId;

    if (post == null) {
      throw new CustomError("Post not found", 404);
    } else if (userId != post.creator_id) {
      throw new CustomError("Only the creator can edit this post", 403);
    }

    if (newTitle) {
      await PostModel.update({ title: newTitle }, { where: { id: postId } });
    }

    if (newContent) {
      const objectName = post.content.split(/\//).pop();
      await this.s3Client.putObject(objectName!, newContent);
    }

    redisClient.del(`post:${postId}`).catch((err) => {
      console.error("delete the post from redis error: " + err);
    });

    return {
      message: "Post was successfully updated",
    };
  }

  public async deletePost(userToken: string, postId: string) {
    const post: PostModel | null = await PostModel.findOne({
      where: {
        id: postId,
      },
    });

    const userId = decodeJwt(userToken).userId;

    if (post == null) {
      throw new CustomError("Post not found", 404);
    } else if (userId != post.creator_id) {
      throw new CustomError("Only the creator delete this post", 403);
    }

    const minioObjectName = post.content.split(/\//).pop();

    if (!minioObjectName) {
      throw new CustomError("Object not found", 404);
    }

    await Promise.all([
      this.s3Client.removeObject(minioObjectName!).catch((err) => {
        throw new Error(`Error when delete a post: ${err}`);
      }),

      PostModel.destroy({ where: { id: postId } }),
      UserLikesModel.destroy({ where: { post_id: postId } }),

      redisClient.del(`post:${postId}`),
    ]);

    return {
      message: "The post was successfully deleted",
    };
  }
}
