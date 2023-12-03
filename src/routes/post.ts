import { Router } from "express";
import {
  getPost,
  editPost,
  deletePost,
  toggleLike,
  toggleSave,
  addComment,
  createPost,
  deleteComment,
} from "../controllers/post";
import { protect } from "../middlewares/auth";
const router: Router = Router();
router.route("/").post(protect, createPost);
// router.route("/search").get(searchPost);
router.route("/:id").get(protect, getPost).delete(protect, deletePost).put(protect, editPost);
router.route("/:id/togglelike").get(protect, toggleLike);
router.route("/:id/togglesave").get(protect, toggleSave);
router.route("/:id/comments").post(protect, addComment);
router.route("/:id/comments/:commentId").delete(protect, deleteComment);

export default router;
