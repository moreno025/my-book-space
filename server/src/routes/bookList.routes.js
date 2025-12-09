import express from "express";
import { protect } from "../middleware/protect.js";
import { createBookList, updateList, deleteList, addBookToList, searchListsByBook, removeBookFromList, saveList } from "../controllers/bookList.controller.js";
import { validateBody } from "../middleware/validate.js";
import { bookListSchema } from "../validators/bookList.validator.js";

const router = express.Router();

router.post("/", protect, validateBody(bookListSchema), createBookList);
router.put("/:listId", protect, updateList);
router.delete("/:listId", protect, deleteList);
router.post("/:listId/add-book", protect, addBookToList);
router.delete("/:listId/remove-book/:googleBookId", protect, removeBookFromList);
router.post("/:listId/save", protect, saveList);
router.get("/search/:title", protect, searchListsByBook);

export default router;