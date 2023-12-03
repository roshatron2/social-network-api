import { Router } from "express";
import {
  showFeed,
  editUser,
  follow,
  getUser,
  unfollow,
  savedPosts,
  likedPosts,
} from "../controllers/user";
import { protect } from "../middlewares/auth";
const router: Router = Router();

router.route("/").put(protect, editUser);
router.route("/feed").get(protect, showFeed);
// router.route("/search").get(searchUser);
router.route("/:username").get(protect, getUser);
router.route("/:username/saved").get(protect, savedPosts);
router.route("/:id/follow").get(protect, follow);
router.route("/:id/unfollow").get(protect, unfollow);

export default router;
