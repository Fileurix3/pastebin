import { Router, NextFunction, Request, Response } from "express";
import { PostsServices } from "./posts_services";
import { authMiddleware } from "../../middleware/auth_middleware";

export class PostsController {
  private postsServices: PostsServices = new PostsServices();
  public router: Router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post("/create", authMiddleware, this.createPost.bind(this));
    this.router.get("/:postId", this.getPostById.bind(this));
    this.router.get("/search/:params", this.searchPost.bind(this));
    this.router.put("/update/:postId", authMiddleware, this.updatePost.bind(this));
    this.router.delete("/delete/:postId", authMiddleware, this.deletePost.bind(this));
  }

  private async createPost(req: Request, res: Response, next: NextFunction) {
    try {
      const userToken = req.cookies.token;
      const { title, content } = req.body;
      const message = await this.postsServices.createPost(title, content, userToken);

      res.status(201).json(message);
    } catch (err) {
      next(err);
    }
  }

  private async getPostById(req: Request, res: Response, next: NextFunction) {
    try {
      const postId = req.params.postId;
      const post = await this.postsServices.getPostById(postId);

      res.status(200).json(post);
    } catch (err) {
      next(err);
    }
  }

  private async searchPost(req: Request, res: Response, next: NextFunction) {
    try {
      const searchParams = req.params.params;
      const posts = await this.postsServices.searchPost(searchParams);

      res.status(200).json({ posts: posts });
    } catch (err) {
      next(err);
    }
  }

  private async updatePost(req: Request, res: Response, next: NextFunction) {
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
      next(err);
    }
  }

  private async deletePost(req: Request, res: Response, next: NextFunction) {
    try {
      const userToken = req.cookies.token;
      const postId = req.params.postId;

      const message = await this.postsServices.deletePost(userToken, postId);

      res.status(200).json(message);
    } catch (err) {
      next(err);
    }
  }
}

/*
export class PostsController {
  private postsServices: PostsServices;

  constructor() {
    this.postsServices = new PostsServices();
  }

  public createPost = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userToken = req.cookies.token;
      const { title, content } = req.body;
      const message = await this.postsServices.createPost(title, content, userToken);

      res.status(201).json(message);
    } catch (err) {
      next(err);
    }
  };

  public getPostById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const postId = req.params.postId;
      const post = await this.postsServices.getPostById(postId);

      res.status(200).json(post);
    } catch (err) {
      next(err);
    }
  };

  public searchPost = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const searchParams = req.params.params;
      const posts = await this.postsServices.searchPost(searchParams);

      res.status(200).json({ posts: posts });
    } catch (err) {
      next(err);
    }
  };

  public updatePost = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
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
      next(err);
    }
  };

  public deletePost = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userToken = req.cookies.token;
      const postId = req.params.postId;

      const message = await this.postsServices.deletePost(userToken, postId);

      res.status(200).json(message);
    } catch (err) {
      next(err);
    }
  };
}
*/
