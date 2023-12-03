import IComment from "./comment";
import { Types, Document } from "mongoose";
import IUser from "./user";

export default interface IPost extends Document {
  user: Types.ObjectId;
  image: string;
  caption: string;
  likes: [Types.ObjectId];
  likeCount: number;
  comments: [Types.ObjectId] | [IComment];
  commentCount: number;
  createdAt: Date;
  isMine?: boolean;
  isLiked?: boolean;
  isSaved?: boolean;
}
