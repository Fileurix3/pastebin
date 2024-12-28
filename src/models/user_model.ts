import mongoose, { Schema, Types } from "mongoose";

export interface IUserModel {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
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
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

export const UserModel = mongoose.model<IUserModel>("users", userSchema);
