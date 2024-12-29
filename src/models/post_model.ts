import mongoose, { Schema, Types } from "mongoose";

export interface IPostModel {
  _id: Types.ObjectId;
  creatorId: Types.ObjectId;
  name: string;
  text: string;
  createdAt: Date;
}

const postSchema = new Schema<IPostModel>({
  creatorId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const PostModel = mongoose.model<IPostModel>("posts", postSchema);
