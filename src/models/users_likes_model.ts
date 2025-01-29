import { DataTypes, Model } from "@sequelize/core";
import { UserModel } from "./user_model";
import { PostModel } from "./post_model";
import sequelize from "../databases/db";

interface UserLikesAttributes {
  user_id: string;
  post_id: string;
}

export class UserLikesModel
  extends Model<UserLikesAttributes>
  implements UserLikesAttributes
{
  public user_id!: string;
  public post_id!: string;
}

UserLikesModel.init(
  {
    user_id: {
      type: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    post_id: {
      type: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    sequelize,
    tableName: "users_likes",
    timestamps: false,
  },
);

UserLikesModel.belongsTo(UserModel, {
  foreignKey: "user_id",
  targetKey: "id",
});
UserLikesModel.belongsTo(PostModel, {
  foreignKey: "post_id",
  targetKey: "id",
  as: "post",
});

UserModel.hasMany(UserLikesModel, {
  foreignKey: "user_id",
  sourceKey: "id",
  as: "likedPosts",
});

PostModel.hasMany(UserLikesModel, {
  foreignKey: "post_id",
  sourceKey: "id",
});
