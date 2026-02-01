import express from "express";
import { 
    searchBooks, 
    getBookByIsbn, 
    getBookById, 
    getTrendingBooks, 
    saveSearchHistory, 
    getSearchHistory, 
    deleteSearchHistory, 
    deleteHistoryItem,
    recommendBooks 
} from "../controllers/book.controller.js";
import { protect } from "../middleware/protect.js";

const router = express.Router();

// Public/Semi-public routes
router.get("/search", searchBooks);
router.get("/trending", getTrendingBooks);
router.get("/isbn/:isbn", getBookByIsbn);
router.get("/:googleBookId", getBookById);

// Protected routes
router.post("/recommend", protect, recommendBooks);
router.post("/search/history", protect, saveSearchHistory);
router.get("/search/history", protect, getSearchHistory);
router.delete("/search/history", protect, deleteSearchHistory);
router.delete("/search/history/:query", protect, deleteHistoryItem);


export default router;
