import { CustomError, decodeJwt, handlerError } from "../../index.js";
import { IUserModel, UserModel } from "../../models/user_model.js";
import { Request, Response } from "express";
import { Types } from "mongoose";
import bcrypt from "bcrypt";

export class UsersServices {
  public getProfileById = async (userId: string) => {
    const userProfile = await this.getUserProfile(userId);

    if (!userProfile.length) {
      throw new CustomError("User not found", 404);
    }

    return userProfile[0];
  };

  public getYourProfile = async (userToken: string) => {
    const userId = decodeJwt(userToken).userId;
    const userProfile = await this.getUserProfile(userId);

    if (!userProfile.length) {
      throw new CustomError("User not found", 404);
    }

    return userProfile[0];
  };

  public async updateUserProfile(
    userToken: string,
    newAvatarUrl: string | null,
    newName: string | null,
  ) {
    const updateFields: Record<string, string> = {};

    if (!newAvatarUrl && !newName) {
      throw new CustomError("At least one field must be updated", 400);
    }

    if (newName) {
      const existingName: IUserModel | null = await UserModel.findOne({
        name: newName,
      });

      if (existingName != null) {
        throw new CustomError("This name already exists", 400);
      }

      updateFields.name = newName;
    }

    if (newAvatarUrl) updateFields.avatar = newAvatarUrl;

    const userId: string = decodeJwt(userToken).userId;

    await UserModel.updateOne({ _id: userId }, updateFields);

    return {
      message: "User profile was successfully update",
    };
  }

  public async changePassword(
    userToken: string,
    oldPassword: string,
    newPassword: string,
  ) {
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

    return {
      message: "Password was successfully update",
    };
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
