import { Router } from "express";
import { login, register, me } from "../controllers/auth";
import { protect } from "../middlewares/auth";
const router: Router = Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/me").get(protect, me);

export default router;
