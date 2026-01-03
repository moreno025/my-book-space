import { Router } from "express";
import { protect } from "../middleware/protect.js";
import { followUser, unfollowUser, getFollowers, getFollowing, getUser, getUserReviews, searchUsers, saveUserSearchHistory, getUserSearchHistory, deleteUserSearchHistoryItem, clearUserSearchHistory, getFollowRequests, acceptFollowRequest, rejectFollowRequest, getUserStats } from "../controllers/user.controller.js";
import { getUserLists } from "../controllers/bookList.controller.js";

const router = Router();

router.get("/search", protect, searchUsers);
router.post("/history", protect, saveUserSearchHistory);
router.get("/history", protect, getUserSearchHistory);
router.delete("/history/:searchedUserId", protect, deleteUserSearchHistoryItem);
router.delete("/history", protect, clearUserSearchHistory);

router.get("/stats/:userId", protect, getUserStats);
router.put("/follow-user/:id", protect, followUser);
router.put("/unfollow-user/:id", protect, unfollowUser);
router.get("/followers/:id", protect, getFollowers);
router.get("/followings/:id", protect, getFollowing);
router.get("/:username", protect, getUser);
router.get("/:username/lists", protect, getUserLists);
router.get("/user-reviews/:userId", protect, getUserReviews);

// Follow Requests
router.get("/requests/pending", protect, getFollowRequests);
router.put("/requests/accept/:requestId", protect, acceptFollowRequest);
router.put("/requests/reject/:requestId", protect, rejectFollowRequest);

export default router;
