import mongoose from "mongoose";
import dotenv from "dotenv";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import BookList from "../models/bookList.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const { DB_USER, DB_PASSWORD, DB_HOST, GOOGLE_BOOKS_API_KEY } = process.env;

if (!DB_USER || !DB_PASSWORD || !DB_HOST) {
    console.error("❌ Missing database environment variables");
    process.exit(1);
}

const mongoDbUrl = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/my-book-space`;
const API_KEY = GOOGLE_BOOKS_API_KEY;

async function syncCategories() {
    try {
        await mongoose.connect(mongoDbUrl);
        console.log("✅ Connected to MongoDB");

        const lists = await BookList.find({});
        console.log(`Processing ${lists.length} lists...`);

        for (const list of lists) {
            let listUpdated = false;
            for (const book of list.books) {
                if (!book.categories || book.categories.length === 0) {
                    console.log(`Syncing categories for: ${book.title}`);
                    try {
                        const response = await axios.get(`https://www.googleapis.com/books/v1/volumes/${book.googleBookId}`, {
                            params: { key: API_KEY }
                        });
                        
                        const categories = response.data.volumeInfo.categories || [];
                        book.categories = categories;
                        listUpdated = true;
                        
                        // Sleep to avoid rate limits
                        await new Promise(resolve => setTimeout(resolve, 200));
                    } catch (error) {
                        console.error(`Failed to sync ${book.title}:`, error.message);
                    }
                }
            }

            if (listUpdated) {
                await list.save();
                console.log(`Updated list: ${list.title}`);
            }
        }

        console.log("Sync completed!");
        process.exit(0);
    } catch (error) {
        console.error("Critical error:", error);
        process.exit(1);
    }
}

syncCategories();
