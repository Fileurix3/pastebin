import { CustomError, decodeJwt } from "../../index.js";
import { UserLikesModel } from "../../models/users_likes_model.js";
import { UserModel } from "../../models/user_model.js";
import { PostModel } from "../../models/post_model.js";
import { Op } from "@sequelize/core";
import bcrypt from "bcrypt";

export class UsersServices {
  public getProfileById = async (userId: string) => {
    const userProfile: UserModel | null = await this.getUserProfile(userId);

    if (userProfile == null) {
      throw new CustomError("User not found", 404);
    }

    return userProfile;
  };

  public getYourProfile = async (userToken: string) => {
    const userId = decodeJwt(userToken).userId;
    const userProfile: UserModel | null = await this.getUserProfile(userId);

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
      const existingName: UserModel | null = await UserModel.findOne({
        where: {
          name: newName,
        },
      });

      if (existingName != null) {
        throw new CustomError("This name already exists", 400);
      }

      updateFields.name = newName;
    }

    if (newAvatarUrl) updateFields.avatar = newAvatarUrl;

    const userId: string = decodeJwt(userToken).userId;

    await UserModel.update(updateFields, { where: { id: userId } });

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

    const user: UserModel | null = await UserModel.findOne({
      where: {
        id: userId,
      },
    });

    if (user == null) {
      throw new CustomError("User not found", 404);
    }

    const isCorrectPassword = await bcrypt.compare(oldPassword, user.password);

    if (!isCorrectPassword) {
      throw new CustomError("The old password is incorrect", 400);
    }

    const hashPassword = await bcrypt.hash(newPassword, 10);

    await UserModel.update({ password: hashPassword }, { where: { id: userId } });

    return {
      message: "Password was successfully update",
    };
  }

  public async likePost(userToken: string, postId: string) {
    const userId = decodeJwt(userToken).userId;
    const post: PostModel | null = await PostModel.findOne({
      where: {
        id: postId,
      },
    });

    if (post == null) {
      throw new CustomError("Post not found", 404);
    }

    const user: UserModel | null = await UserModel.findOne({
      where: {
        id: userId,
      },
    });

    if (user == null) {
      throw new CustomError("User not found", 404);
    }

    const userIsLikePost: UserLikesModel | null = await UserLikesModel.findOne({
      where: {
        [Op.and]: [{ user_id: userId }, { post_id: postId }],
      },
    });

    if (userIsLikePost != null) {
      await UserLikesModel.destroy({
        where: {
          [Op.and]: [{ user_id: userId }, { post_id: postId }],
        },
      });

      return {
        message: "The post was successfully removed from likes",
      };
    }

    await UserLikesModel.create({
      user_id: userId,
      post_id: postId,
    });

    return {
      message: "The post was successfully added to likes",
    };
  }

  private async getUserProfile(userId: string): Promise<UserModel | null> {
    const userProfile: UserModel | null = await UserModel.findOne({
      where: {
        id: userId,
      },
      attributes: ["id", "name", "avatar_url", "createdAt"],
      include: [
        {
          model: PostModel,
          as: "posts",
          attributes: ["id", "title", "createdAt", "updatedAt"],
        },
        {
          model: UserLikesModel,
          as: "likedPosts",
          attributes: ["post_id"],
          include: [
            {
              model: PostModel,
              attributes: ["title"],
              as: "post",
            },
          ],
        },
      ],
    });

    return userProfile;
  }
}
