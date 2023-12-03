import { Request, Response, NextFunction } from "express";
import asyncHandler from "../middlewares/asyncHandler";
import User from "../models/User";
import Post from "../models/Post";
import Comment from "../models/Comment";
import IRequest from "../types/request";
import IPost from "../types/post";
import IUser from "../types/user";
import IComment from "../types/comment";
import { Types, LeanDocument, ObjectId } from "mongoose";

const showFeed = asyncHandler(async (req: IRequest, res: Response, next: NextFunction) => {
  const following = req.user.following;

  const users = await User.find()
    .where("_id")
    .in(following.concat([req.user.id]))
    .exec();

  const postIds = users.map((user) => user.posts).flat();

  const posts = await Post.find()
    .populate({
      path: "comments",
      select: "text",
      populate: { path: "user", select: "profilePic name username" },
      model: Comment,
    })
    .populate({ path: "user", select: "profilePic name username" })
    .sort("-createdAt")
    .where("_id")
    .in(postIds)
    .lean()
    .exec();

  posts.forEach(
    (
      post: LeanDocument<
        IPost & {
          _id: any;
        }
      >
    ) => {
      // is the loggedin user liked the post
      post.isLiked = false;
      const likes = post.likes.map((like) => like.toString());
      if (likes.includes(req.user.id)) {
        post.isLiked = true;
      }

      // is the loggedin user saved this post
      post.isSaved = false;
      const savedPosts = req.user.savedPosts.map((post: ObjectId) => post.toString());
      if (savedPosts.includes(post._id)) {
        post.isSaved = true;
      }

      // is the post belongs to the loggedin user
      post.isMine = false;
      if (post.user._id.toString() === req.user.id) {
        post.isMine = true;
      }

      // is the comment belongs to the loggedin user
      post.comments.map((comment: any) => {
        comment.isCommentMine = false;
        if (comment.user._id.toString() === req.user.id) {
          comment.isCommentMine = true;
        }
      });
    }
  );

  res.status(200).json({ success: true, data: posts });
});
const editUser = asyncHandler(async (req: IRequest, res: Response, next: NextFunction) => {
  const { image, username, name, website, bio, email, phone } = req.body;

  const fieldsToUpdate: any = {};
  if (image) fieldsToUpdate.image = image;
  if (username) fieldsToUpdate.username = username;
  if (name) fieldsToUpdate.name = name;
  if (email) fieldsToUpdate.email = email;
  if (phone) fieldsToUpdate.phone = phone;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      $set: { ...fieldsToUpdate, website, bio },
    },
    {
      new: true,
      runValidators: true,
    }
  ).select("profilePic username fullname email bio website");

  res.status(200).json({ success: true, data: user });
});
const follow = asyncHandler(async (req: IRequest, res: Response, next: NextFunction) => {
  const user: IUser | null = await User.findById(req.params.id);

  if (!user) {
    return next({
      message: `No user found for id ${req.params.id}`,
      statusCode: 404,
    });
  }

  if (req.params.id === req.user.id) {
    return next({ message: "You can't unfollow/follow yourself", status: 400 });
  }

  if (user?.followers?.includes(req.user.id)) {
    return next({ message: "You are already following him", status: 400 });
  }

  await User.findByIdAndUpdate(req.params.id, {
    $push: { followers: req.user.id },
    $inc: { followersCount: 1 },
  });
  await User.findByIdAndUpdate(req.user.id, {
    $push: { following: req.params.id },
    $inc: { followingCount: 1 },
  });

  res.status(200).json({ success: true, data: {} });
});
const getUser = asyncHandler(async (req: IRequest, res: Response, next: NextFunction) => {
  const user = await User.findOne({ username: req.params.username })
    .select("-password -savedPosts")
    .populate({ path: "posts", select: "image commentCount likeCount", model: Post })
    .populate({ path: "followers", select: "profilePic username name" })
    .populate({ path: "following", select: "profilePic username name" })
    .lean()
    .exec();

  if (!user) {
    return next({
      message: `The user ${req.params.username} is not found`,
      statusCode: 404,
    });
  }
  res.json({
    sucess: true,
    data: user,
  });
});
const unfollow = asyncHandler(async (req: IRequest, res: Response, next: NextFunction) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next({
      message: `No user found for ID ${req.params.id}`,
      statusCode: 404,
    });
  }

  // make the sure the user is not the logged in user
  if (req.params.id === req.user.id) {
    return next({ message: "You can't follow/unfollow yourself", status: 400 });
  }

  await User.findByIdAndUpdate(req.params.id, {
    $pull: { followers: req.user.id },
    $inc: { followersCount: -1 },
  });
  await User.findByIdAndUpdate(req.user.id, {
    $pull: { following: req.params.id },
    $inc: { followingCount: -1 },
  });

  res.status(200).json({ success: true, data: {} });
});
const savedPosts = asyncHandler(async (req: IRequest, res: Response, next: NextFunction) => {
  const id: any = req.user.id;
  const user = await User.findOne({ username: req.params.username })
    .populate({
      path: "savedPosts",
      select: "image likeCount commentCount caption",
      model: Post,
    })
    .exec();

  if (user?._id.toString() !== id) {
    next({
      message: "You are not authorized to access this",
      status: 403,
    });
  }
  const posts = user?.savedPosts;
  res.json({
    sucess: true,
    data: posts,
  });
});
const likedPosts = asyncHandler(async (req: IRequest, res: Response, next: NextFunction) => {
  const id = req.user.id;
  const posts = await User.findById(id).populate({
    path: "likedPosts",
    select: "image caption",
    populate: {
      path: "user",
      select: "username profilePic",
    },
  });
});

export { showFeed, editUser, follow, getUser, unfollow, savedPosts, likedPosts };
