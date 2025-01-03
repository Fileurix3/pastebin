import { Request, Response } from "express";
import { PostsServices } from "./posts_services.js";
import { handlerError } from "../../index.js";

export class PostsController {
  private postsServices: PostsServices;

  constructor() {
    this.postsServices = new PostsServices();
  }

  public createPost = async (req: Request, res: Response): Promise<void> => {
    try {
      const userToken = req.cookies.token;
      const { title, content } = req.body;
      const message = await this.postsServices.createPost(title, content, userToken);

      res.status(201).json(message);
    } catch (err) {
      handlerError(err, res);
    }
  };

  public getPostById = async (req: Request, res: Response): Promise<void> => {
    try {
      const postId = req.params.postId;
      const post = await this.postsServices.getPostById(postId);

      res.status(200).json(post);
    } catch (err) {
      handlerError(err, res);
    }
  };

  public searchPost = async (req: Request, res: Response): Promise<void> => {
    try {
      const searchParams = req.params.params;
      const posts = await this.postsServices.searchPost(searchParams);

      res.status(200).json({ posts: posts });
    } catch (err) {
      handlerError(err, res);
    }
  };

  public updatePost = async (req: Request, res: Response): Promise<void> => {
    try {
      const postId = req.params.postId;
      const userToken = req.cookies.token;
      const { newTitle, newContent } = req.body;
      const message = await this.postsServices.updatePost(
        newTitle,
        newContent,
        postId,
        userToken,
      );

      res.status(200).json(message);
    } catch (err) {
      handlerError(err, res);
    }
  };

  public deletePost = async (req: Request, res: Response): Promise<void> => {
    try {
      const userToken = req.cookies.token;
      const postId = req.params.postId;

      const message = await this.postsServices.deletePost(userToken, postId);

      res.status(200).json(message);
    } catch (err) {
      handlerError(err, res);
    }
  };
}
