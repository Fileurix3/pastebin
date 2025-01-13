import { CustomError, decodeJwt } from "../../index.js";
import { IUserModel, UserModel } from "../../models/user_model.js";
import { IPostModel, PostModel } from "../../models/post_model.js";
import { Types } from "mongoose";
import bcrypt from "bcrypt";

export class UsersServices {
  public getProfileById = async (userId: string) => {
    const userProfile: IUserModel | null = await this.getUserProfile(userId);

    if (userProfile == null) {
      throw new CustomError("User not found", 404);
    }

    return userProfile;
  };

  public getYourProfile = async (userToken: string) => {
    const userId = decodeJwt(userToken).userId;
    const userProfile: IUserModel | null = await this.getUserProfile(userId);

    if (userProfile == null) {
      throw new CustomError("User not found", 404);
    }

    return userProfile;
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

  public async likePost(userToken: string, postId: string) {
    const userId = decodeJwt(userToken).userId;
    const post: IPostModel | null = await PostModel.findById(postId);

    if (post == null) {
      throw new CustomError("Post not found", 404);
    }

    const user: IUserModel | null = await UserModel.findById(userId);

    if (user == null) {
      throw new CustomError("User not found", 404);
    }

    if (
      user.likePosts.some(
        (likePost) =>
          likePost.title == post.title &&
          likePost.postId.toString() == post._id.toString(),
      )
    ) {
      await UserModel.updateOne(
        { _id: userId },
        {
          $pull: {
            likePosts: { title: post.title, postId: post._id },
          },
        },
      );

      await PostModel.updateOne({ _id: post._id }, { $inc: { likesCount: -1 } });

      return {
        message: "The post was successfully removed from likes",
      };
    }

    await UserModel.updateOne(
      { _id: userId },
      { $addToSet: { likePosts: { title: post.title, postId: post._id } } },
    );
    await PostModel.updateOne({ _id: post._id }, { $inc: { likesCount: 1 } });

    return {
      message: "The post was successfully added to likes",
    };
  }

  private async getUserProfile(userId: string): Promise<IUserModel | null> {
    const userProfile = await UserModel.findOne({ _id: new Types.ObjectId(userId) });

    return userProfile;
  }
}
