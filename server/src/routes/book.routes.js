import express from "express";
import { searchBooks, getBookById } from "../controllers/book.controller.js";

const router = express.Router();

router.get("/search", searchBooks);
router.get("/:googleBookId", getBookById);

export default router;
