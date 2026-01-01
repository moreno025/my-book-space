import { Router } from "express";
import { protect } from "../middleware/protect.js";
import { followUser, unfollowUser, getFollowers, getFollowing, getUser, getUserLists, getUserReviews, searchUsers } from "../controllers/user.controller.js";

const router = Router();

router.get("/search", protect, searchUsers);
router.put("/follow-user/:id", protect, followUser);
router.put("/unfollow-user/:id", protect, unfollowUser);
router.get("/followers/:id", protect, getFollowers);
router.get("/followings/:id", protect, getFollowing);
router.get("/:username", protect, getUser);
router.get("/:username/lists", protect, getUserLists);
router.get("/user-reviews/:userId", protect, getUserReviews);

export default router;
