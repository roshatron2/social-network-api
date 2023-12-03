import { Schema, model, connect, Types } from "mongoose";
import IComment from "../types/comment";

const commentSchema: Schema = new Schema({
  user: {
    type: Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  replies: [
    {
      type: Types.ObjectId,
      ref: "Comment",
    },
  ],
  replyCount: {
    type: Number,
    default: 0,
  },
  likes: [
    {
      type: Types.ObjectId,
      ref: "User",
    },
  ],
  likeCount: {
    type: Number,
    default: 0,
  },
});

export default model<IComment>("Comments", commentSchema);
