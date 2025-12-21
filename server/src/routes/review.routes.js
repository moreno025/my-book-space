import express from "express";
import { protect } from "../middleware/protect.js";
import { createReview, updateReview, deleteReview, getBookReviews } from "../controllers/review.controller.js";
import { createReviewSchema } from "../validators/review.validator.js";
import { validateBody } from "../middleware/validate.js";


const router = express.Router();

router.post("/:bookId", protect, validateBody(createReviewSchema), createReview);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);
router.get("/book/:bookId", getBookReviews);


export default router;
