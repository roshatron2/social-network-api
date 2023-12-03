import { Router } from "express";
import { editComment, toggleCommentLike, replyToComment } from "../controllers/comment";
import { protect } from "../middlewares/auth";
const router: Router = Router();

router.route("/").get(protect, (req, res) => {
  res.send("Comment route working");
});
router.route("/:commentId").put(protect, editComment);
router.route("/:commentId/toggleLike").put(protect, toggleCommentLike);
router.route("/:commentId/reply").post(protect, replyToComment);

export default router;
