import { Types } from "mongoose";
export default interface IUser extends Document {
  name: string;
  username: string;
  email: string;
  password: string;
  phone?: string;
  profilePic: string;
  bio?: string;
  website?: string;
  followers?: [Types.ObjectId] | [IUser];
  followerCount: number;
  following?: [Types.ObjectId] | [IUser];
  followingCount: number;
  posts?: [Types.ObjectId];
  postCount: number;
  savedPosts?: [Types.ObjectId];
  likedPosts?: [Types.ObjectId];
  getJwtToken(): string;
  checkPassword(password: string): boolean;
}
