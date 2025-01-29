import { DataTypes, Model } from "@sequelize/core";
import { UserModel } from "./user_model";
import sequelize from "../databases/db";

interface PostAttributes {
  id?: string;
  creator_id: string;
  title: string;
  content: string;
}

export class PostModel extends Model<PostAttributes> implements PostAttributes {
  public id?: string;
  public creator_id!: string;
  public title!: string;
  public content!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PostModel.init(
  {
    id: {
      type: DataTypes.UUIDV4,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      unique: true,
    },
    creator_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "posts",
    timestamps: true,
  },
);

PostModel.belongsTo(UserModel, {
  foreignKey: "creator_id",
  targetKey: "id",
  as: "creator",
});

UserModel.hasMany(PostModel, {
  foreignKey: "creator_id",
  sourceKey: "id",
  as: "posts",
});
