import { CustomError, decodeJwt, handlerError } from "../index.js";
import { Request, Response } from "express";
import { IUserModel, UserModel } from "../models/user_model.js";
import { Types } from "mongoose";
import bcrypt from "bcrypt";

export class UserServices {
  public getProfileById = async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.userId;

    try {
      const userProfile = await this.getUserProfile(userId);

      if (!userProfile.length) {
        throw new CustomError("User not found", 404);
      }

      res.status(200).json({
        user: userProfile[0],
      });
    } catch (err: unknown) {
      handlerError(err, res);
    }
  };

  public getYourProfile = async (req: Request, res: Response): Promise<void> => {
    const userToken = req.cookies.token;

    try {
      const userId = decodeJwt(userToken).userId;
      const userProfile = await this.getUserProfile(userId);

      if (!userProfile.length) {
        throw new CustomError("User not found", 404);
      }

      res.status(200).json({
        user: userProfile[0],
      });
    } catch (err: unknown) {
      handlerError(err, res);
    }
  };

  public async updateUserProfile(req: Request, res: Response): Promise<void> {
    const userToken = req.cookies.token;
    const { newAvatarUrl, newName } = req.body;

    try {
      const updateFields: Record<string, string> = {};

      if (!newAvatarUrl && !newName) {
        throw new CustomError("At least one field must be updated", 400);
      }

      if (newName) {
        const existingName: IUserModel | null = await UserModel.findOne({ name: newName });

        if (existingName != null) {
          throw new CustomError("This name already exists", 400);
        }

        updateFields.name = newName;
      }

      if (newAvatarUrl) updateFields.avatar = newAvatarUrl;

      const userId: string = decodeJwt(userToken).userId;

      await UserModel.updateOne({ _id: userId }, updateFields);

      res.status(200).json({
        message: "User profile was successfully update",
      });
    } catch (err: unknown) {
      handlerError(err, res);
    }
  }

  public async changePassword(req: Request, res: Response): Promise<void> {
    const userToken = req.cookies.token;
    const { oldPassword, newPassword } = req.body;

    try {
      if (!oldPassword || !newPassword) {
        throw new CustomError("Old and new passwords are required", 400);
      } else if (oldPassword == newPassword) {
        throw new CustomError("New password must be different from old password", 400);
      }

      if (newPassword.length < 6) {
        throw new CustomError("Password must be at least 6 characters long", 400);
      }

      const userId = decodeJwt(userToken).userId;

      const user: IUserModel | null = await UserModel.findById(userId);

      if (user == null) {
        throw new CustomError("User not found", 404);
      }

      const isCorrectPassword = await bcrypt.compare(oldPassword, user.password);

      if (!isCorrectPassword) {
        throw new CustomError("The old password is incorrect", 400);
      }

      const hashPassword = await bcrypt.hash(newPassword, 10);

      await UserModel.updateOne({ _id: userId }, { password: hashPassword });

      res.status(200).json({
        message: "Password was successfully update",
      });
    } catch (err: unknown) {
      handlerError(err, res);
    }
  }

  private async getUserProfile(userId: string): Promise<any> {
    const userProfile = await UserModel.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "posts",
          localField: "_id",
          foreignField: "creatorId",
          as: "posts",
        },
      },

      {
        $project: {
          _id: 1,
          name: 1,
          avatar: 1,
          posts: {
            $map: {
              input: "$posts",
              as: "posts",
              in: {
                _id: "$$posts._id",
                name: "$$posts.name",
                createdAt: "$$posts.createdAt",
              },
            },
          },
        },
      },
    ]);

    return userProfile;
  }
}
