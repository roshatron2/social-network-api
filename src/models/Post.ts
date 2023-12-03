import { Schema, model, Types } from "mongoose";
import IPost from "../types/post";

const postSchema: Schema = new Schema({
  user: {
    type: Types.ObjectId,
    ref: "User",
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  caption: {
    type: String,
    required: true,
  },
  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  likeCount: {
    type: Number,
    default: 0,
  },
  comments: [
    {
      type: Types.ObjectId,
      ref: "Comment",
    },
  ],
  commentCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

export default model<IPost>("Posts", postSchema);

// Name: string
// Image: string
// Bio: string
// Posts : post_id
// Friends: user_id
