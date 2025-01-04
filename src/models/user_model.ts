import mongoose, { Schema, Types } from "mongoose";

export interface IUserModel {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  avatar: string;
  likePosts: Types.ObjectId[];
  createdAt: Date;
}

const userSchema = new Schema<IUserModel>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: null,
  },
  likePosts: {
    type: [Schema.Types.ObjectId],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const UserModel = mongoose.model<IUserModel>("users", userSchema);
