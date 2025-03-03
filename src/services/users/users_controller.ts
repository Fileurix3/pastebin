import { Router, NextFunction, Request, Response } from "express";
import { UsersServices } from "./users_services";
import { authMiddleware } from "../../middleware/auth_middleware";

export class UsersController {
  private usersServices: UsersServices = new UsersServices();
  public router: Router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/profile/:userId", this.getProfileById.bind(this));
    this.router.get("/profile", authMiddleware, this.getYourProfile.bind(this));
    this.router.put("/update/profile", authMiddleware, this.updateUserProfile.bind(this));
    this.router.put("/change/password", authMiddleware, this.changePassword.bind(this));
    this.router.put("/like/post/:postId", authMiddleware, this.likePost.bind(this));
  }

  private async getProfileById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.userId;
      const userProfile = await this.usersServices.getProfileById(userId);

      res.status(200).json({
        user: userProfile,
      });
    } catch (err) {
      next(err);
    }
  }

  private async getYourProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userToken = req.cookies.token;
      const userProfile = await this.usersServices.getYourProfile(userToken);

      res.status(200).json({
        user: userProfile,
      });
    } catch (err) {
      next(err);
    }
  }

  private async updateUserProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userToken = req.cookies.token;
      const { newAvatarUrl, newName } = req.body;

      const message = await this.usersServices.updateUserProfile(
        userToken,
        newAvatarUrl,
        newName,
      );

      res.status(200).json(message);
    } catch (err) {
      next(err);
    }
  }

  private async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userToken = req.cookies.token;
      const { oldPassword, newPassword } = req.body;

      const message = await this.usersServices.changePassword(
        userToken,
        oldPassword,
        newPassword,
      );

      res.status(200).json(message);
    } catch (err) {
      next(err);
    }
  }

  private async likePost(req: Request, res: Response, next: NextFunction) {
    try {
      const userToken = req.cookies.token;
      const postId = req.params.postId;

      const message = await this.usersServices.likePost(userToken, postId);

      res.status(200).json(message);
    } catch (err: unknown) {
      next(err);
    }
  }
}
