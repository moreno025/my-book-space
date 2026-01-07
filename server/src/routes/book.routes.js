import express from "express";
import { searchBooks, getBookById, getBookByIsbn, getTrendingBooks, saveSearchHistory, getSearchHistory, deleteSearchHistory, deleteHistoryItem } from "../controllers/book.controller.js";
import { protect } from "../middleware/protect.js";

const router = express.Router();

router.get("/search", searchBooks);
router.get("/trending", getTrendingBooks);
router.get("/isbn/:isbn", getBookByIsbn);
router.get("/:googleBookId", getBookById);
router.post("/search/history", protect, saveSearchHistory);
router.get("/search/history", protect, getSearchHistory);
router.delete("/search/history", protect, deleteSearchHistory);
router.delete("/search/history/:query", protect, deleteHistoryItem);


export default router;
