import express from "express";
import { createChallenge, getUserChallenges, deleteChallenge } from "../controllers/readingChallenge.controller.js";
import { protect } from "../middleware/protect.js";

const router = express.Router();

router.post("/", protect, createChallenge);
router.get("/", protect, getUserChallenges);
router.delete("/:challengeId", protect, deleteChallenge);

export default router;
