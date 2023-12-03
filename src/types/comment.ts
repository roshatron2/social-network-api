import { ObjectId, Types, Document } from "mongoose";
import IUser from "./user";

export default interface IComment extends Document {
  text: string;
  user: ObjectId | IUser;
  replies: [Types.ObjectId];
  replyCount: number;
  likes: [Types.ObjectId];
  likeCount: number;
  isCommentMine: boolean;
  createdAt: Date;
}
