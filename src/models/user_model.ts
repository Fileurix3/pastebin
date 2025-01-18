import { DataTypes, Model } from "@sequelize/core";
import sequelize from "../databases/db.js";

interface UserAttributes {
  id?: string;
  name: string;
  email: string;
  password: string;
  avatar_url?: string;
  createdAt?: Date;
}

export class UserModel extends Model<UserAttributes> implements UserAttributes {
  public id?: string;
  public name!: string;
  public email!: string;
  public password!: string;
  public avatar_url?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserModel.init(
  {
    id: {
      type: DataTypes.UUIDV4,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    avatar_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true,
  },
);
