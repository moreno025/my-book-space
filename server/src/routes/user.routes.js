import { Router } from "express";
import { protect } from "../middleware/protect.js";
import { followUser, unfollowUser, getFollowers, getFollowing, getUser } from "../controllers/user.controller.js";

const router = Router();

router.put("/follow-user/:id", protect, followUser);
router.put("/unfollow-user/:id", protect, unfollowUser);
router.get("/followers/:id", protect, getFollowers);
router.get("/followings/:id", protect, getFollowing);
router.get("/:username", getUser);

export default router;
