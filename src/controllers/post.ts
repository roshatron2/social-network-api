import { Request, Response, NextFunction } from "express";
import asyncHandler from "../middlewares/asyncHandler";
import Post from "../models/Post";
import User from "../models/User";
import Comment from "../models/Comment";
import IRequest from "../types/request";
import IPost from "../types/post";

const createPost = asyncHandler(async (req: IRequest, res: Response, next: NextFunction) => {
  const { caption, image, tags } = req.body;
  const user = req.user.id;

  let post: IPost = await Post.create({ caption, image, user });

  await User.findByIdAndUpdate(req.user.id, {
    $push: { posts: post._id },
    $inc: { postCount: 1 },
  });
  // chance of not working
  post = await post.populate({ path: "user", select: "profilePic username name" });

  res.status(200).json({ success: true, data: post });
});
const getPost = asyncHandler(async (req: IRequest, res: Response, next: NextFunction) => {
  let post: any | null = await Post.findById(req.params.id)
    .populate([
      { path: "user", select: "username profilePic name" },
      {
        path: "comments",
        select: "text likeCount replies",
        model: Comment,
        populate: {
          path: "user",
          select: "username profilePic",
        },
      },
    ])
    .lean()
    .exec();

  if (!post) {
    return next({
      message: `No post found for id ${req.params.id}`,
      statusCode: 404,
    });
  }

  // is the post belongs to loggedin user?
  post.isMine = req.user.id === post.user._id.toString();

  // is the loggedin user liked the post??
  const likes = post.likes.map((like: any) => like.toString());
  post.isLiked = likes.includes(req.user.id);

  // is the loggedin user liked the post??
  const savedPosts = req.user.savedPosts.map((post: any) => post.toString());
  post.isSaved = savedPosts.includes(req.params.id);

  // is the comment on the post belongs to the logged in user?
  post.comments.forEach((comment: any) => {
    comment.isCommentMine = false;

    const userStr = comment.user._id.toString();
    if (userStr === req.user.id) {
      comment.isCommentMine = true;
    }
  });

  res.status(200).json({ success: true, data: post });
});
const editPost = asyncHandler(async (req: IRequest, res: Response, next: NextFunction) => {
  const { image, caption } = req.body;
  let post: IPost | null = await Post.findById(req.params.id);
  let user = req.user.id;

  if (user !== post?.user.toString()) {
    return next({
      message: `This post doesn't belong to you`,
      statusCode: 403,
    });
  }
  if (image) post!.image = image;
  if (caption) post!.caption = caption;
  await post!.save();
  res.status(200).json({ sucess: true, data: post });
});
const deletePost = asyncHandler(async (req: IRequest, res: Response, next: NextFunction) => {
  const post: IPost | null = await Post.findById(req.params.id);

  if (!post) {
    return next({
      message: `No post found for id ${req.params.id}`,
      statusCode: 404,
    });
  }

  if (post.user.toString() !== req.user.id) {
    return next({
      message: "You are not authorized to delete this post",
      statusCode: 401,
    });
  }

  await User.findByIdAndUpdate(req.user.id, {
    $pull: { posts: req.params.id },
    $inc: { postCount: -1 },
  });

  await post.remove();

  res.status(200).json({ success: true, data: {} });
});
const toggleLike = asyncHandler(async (req: IRequest, res: Response, next: NextFunction) => {
  // make sure that the post exists
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next({
      message: `No post found for id ${req.params.id}`,
      statusCode: 404,
    });
  }

  if (post.likes.includes(req.user.id)) {
    const index = post.likes.indexOf(req.user.id);
    post.likes.splice(index, 1);
    post.likeCount = post.likeCount - 1;
    await post.save();
  } else {
    post.likes.push(req.user.id);
    post.likeCount = post.likeCount + 1;
    await post.save();
  }

  res.status(200).json({ success: true, data: post });
});
const toggleSave = asyncHandler(async (req: IRequest, res: Response, next: NextFunction) => {
  // make sure that the post exists
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next({
      message: `No post found for id ${req.params.id}`,
      statusCode: 404,
    });
  }

  const { user } = req;

  if (user.savedPosts.includes(req.params.id)) {
    await User.findByIdAndUpdate(user.id, {
      $pull: { savedPosts: req.params.id },
    });
  } else {
    await User.findByIdAndUpdate(user.id, {
      $push: { savedPosts: req.params.id },
    });
  }

  res.status(200).json({ sucess: true, data: post });
});
const addComment = asyncHandler(async (req: IRequest, res: Response, next: NextFunction) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next({
      message: `No post found for id ${req.params.id}`,
      statusCode: 404,
    });
  }

  let comment = await Comment.create({
    user: req.user.id,
    post: req.params.id,
    text: req.body.text,
  });

  post.comments.push(comment._id);
  post.commentCount = post.commentCount + 1;
  await post.save();

  comment = await comment.populate({ path: "user", select: "profilePic username fullname" });

  res.status(200).json({ success: true, data: comment });
});

const deleteComment = asyncHandler(async (req: IRequest, res: Response, next: NextFunction) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next({
      message: `No post found for id ${req.params.id}`,
      statusCode: 404,
    });
  }

  const comment = await Comment.findOne({
    _id: req.params.commentId,
    post: req.params.id,
  });

  if (!comment) {
    return next({
      message: `No comment found for id ${req.params.id}`,
      statusCode: 404,
    });
  }

  if (comment.user.toString() !== req.user.id) {
    return next({
      message: "You are not authorized to delete this comment",
      statusCode: 401,
    });
  }

  // remove the comment from the post
  const index = post.comments.indexOf(comment._id);
  post.comments.splice(index, 1);
  post.commentCount = post.commentCount - 1;
  await post.save();

  await comment.remove();

  res.status(200).json({ success: true, data: {} });
});

export {
  createPost,
  getPost,
  editPost,
  deletePost,
  toggleLike,
  toggleSave,
  addComment,
  deleteComment,
};
