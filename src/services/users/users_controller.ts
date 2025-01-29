import { NextFunction, Request, Response } from "express";
import { UsersServices } from "./users_services";

export class UsersController {
  private usersServices: UsersServices;

  constructor() {
    this.usersServices = new UsersServices();
  }

  public getProfileById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.params.userId;
      const userProfile = await this.usersServices.getProfileById(userId);

      res.status(200).json({
        user: userProfile,
      });
    } catch (err) {
      next(err);
    }
  };

  public getYourProfile = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userToken = req.cookies.token;
      const userProfile = await this.usersServices.getYourProfile(userToken);

      res.status(200).json({
        user: userProfile,
      });
    } catch (err) {
      next(err);
    }
  };

  public updateUserProfile = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
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
  };

  public changePassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
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
  };

  public likePost = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userToken = req.cookies.token;
      const postId = req.params.postId;

      const message = await this.usersServices.likePost(userToken, postId);

      res.status(200).json(message);
    } catch (err: unknown) {
      next(err);
    }
  };
}
