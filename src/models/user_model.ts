import mongoose, { Schema, Types } from "mongoose";

export interface IUserModel {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  avatar: string;
  likePosts: [
    {
      title: string;
      postId: Types.ObjectId;
    },
  ];
  posts: [
    {
      title: string;
      postId: string;
    },
  ];
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
    type: [
      {
        _id: false,
        title: {
          type: String,
          required: true,
        },
        postId: {
          type: Schema.Types.ObjectId,
          required: true,
        },
      },
    ],
    default: [],
  },
  posts: {
    type: [
      {
        _id: false,
        title: {
          type: String,
          required: true,
        },
        postId: {
          type: Schema.Types.ObjectId,
          required: true,
        },
      },
    ],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const UserModel = mongoose.model<IUserModel>("users", userSchema);
