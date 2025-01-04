import mongoose, { Schema, Types } from "mongoose";

export interface IPostModel {
  _id: Types.ObjectId;
  creatorId: Types.ObjectId;
  likesCount: number;
  title: string;
  content: string;
  createdAt: Date;
}

const postSchema = new Schema<IPostModel>({
  creatorId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  likesCount: {
    type: Number,
    default: 0,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const PostModel = mongoose.model<IPostModel>("posts", postSchema);
