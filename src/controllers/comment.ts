import IComment from "comment";
import { Request, Response, NextFunction } from "express";
import IRequest from "request";
import asyncHandler from "../middlewares/asyncHandler";
import Comment from "../models/Comment";

const editComment = asyncHandler(async (req: IRequest, res: Response, next: NextFunction) => {
  const commentId = req.params.commentId;
  const { text } = req.body;

  const comment: IComment | null = await Comment.findById(commentId);
  const user = req.user.id;

  if (!comment) {
    return next({
      message: "Comment Not Found",
      statusCode: 404,
    });
  }

  if (user !== comment?.user.toString()) {
    return next({
      message: `This comment does not belong to you`,
      statusCode: 403,
    });
  }
  comment!.text = text;
  await comment!.save();

  res.status(200).json({
    sucess: true,
    data: comment,
  });
});
const toggleCommentLike = asyncHandler(async (req: IRequest, res: Response, next: NextFunction) => {
  const commentId = req.params.commentId;

  const comment: IComment | null = await Comment.findById(commentId);

  if (!comment) {
    return next({
      message: "Comment Not Found",
      statusCode: 404,
    });
  }

  if (comment?.likes.includes(req.user.id)) {
    const index = comment.likes.indexOf(req.user.id);
    comment.likes.splice(index, 1);
    comment!.likeCount -= 1;
    await comment.save();
  } else {
    comment!.likes.push(req.user.id);
    comment!.likeCount += 1;
    await comment?.save();
  }
  res.status(200).json({
    sucess: true,
    data: comment,
  });
});
const replyToComment = asyncHandler(async (req: IRequest, res: Response, next: NextFunction) => {
  const { text } = req.body;
  let comment: IComment | null = await Comment.findById(req.params.commentId);

  if (!comment) {
    return next({
      message: `No comment found for ${req.params.id}`,
      statusCode: 404,
    });
  }

  let reply = await Comment.create({ user: req.user.id, text });
  comment.replies.push(reply._id);
  comment.replyCount += 1;
  await comment.save();

  res.status(200).json({
    sucess: true,
    data: comment,
  });
});

export { editComment, toggleCommentLike, replyToComment };
