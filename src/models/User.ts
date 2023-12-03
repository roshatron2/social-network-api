import { Schema, model, connect, Types } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import IUser from "../types/user";

const userSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
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
  phone: {
    type: String,
  },
  profilePic: {
    type: String,
    required: true,
    default: "https://bit.ly/30TIE1h",
  },
  bio: {
    type: String,
  },
  website: {
    type: String,
  },
  followers: [{ type: Types.ObjectId, ref: "User" }],
  followersCount: {
    type: Number,
    default: 0,
  },
  followingCount: {
    type: Number,
    default: 0,
  },
  following: [{ type: Types.ObjectId, ref: "User" }],
  posts: [{ type: Types.ObjectId, ref: "Post" }],
  postCount: {
    type: Number,
    default: 0,
  },
  savedPosts: [
    {
      type: Types.ObjectId,
      ref: "Post",
    },
  ],
  likedPosts: [
    {
      type: Types.ObjectId,
      ref: "Post",
    },
  ],
});

userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.getJwtToken = function (): string {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET || "secret", {
    expiresIn: "30d",
  });
};

userSchema.methods.checkPassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

export default model<IUser>("User", userSchema);
