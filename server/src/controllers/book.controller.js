import axios from "axios";
import SearchHistory from "../models/searchHistory.model.js";
import logger from "../utils/logger.js";
import { cleanGoogleBooksUrl } from "../utils/bookUtils.js";


// ------------------------
// Buscar libros
// ------------------------
export const searchBooks = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: "Debes proporcionar un término de búsqueda" });

    const response = await axios.get("https://www.googleapis.com/books/v1/volumes", {
      params: {
        q,
        key: process.env.GOOGLE_BOOKS_API_KEY,
        maxResults: 20,
        printType: "books",
        orderBy: "relevance",
      },
    });

    const books = (response.data.items ?? []).map(item => {
      if (item.volumeInfo?.imageLinks?.thumbnail) {
        item.volumeInfo.imageLinks.thumbnail = cleanGoogleBooksUrl(item.volumeInfo.imageLinks.thumbnail);
      }
      return item;
    });

    res.status(200).json({ ...response.data, items: books });
  } catch (error) {
    if (error.response) {
      logger.error("Error buscando libros (Google API): " + error.response.status + " " + JSON.stringify(error.response.data));
      return res.status(error.response.status).json({ 
        message: "Error de la API de Google Books", 
        error: error.response.data 
      });
    }
    logger.error("Error buscando libros: " + error.message);
    res.status(500).json({ message: "Error buscando libros", error: error.message });
  }
};


// ------------------------
// Obtener libro por ID
// ------------------------
export const getBookById = async (req, res) => {
  try {
    const { googleBookId } = req.params;
    if (!googleBookId) return res.status(400).json({ message: "Debe proporcionar un ID de libro" });

    const response = await axios.get(`https://www.googleapis.com/books/v1/volumes/${googleBookId}`, {
      params: { key: process.env.GOOGLE_BOOKS_API_KEY }
    });

    const v = response.data.volumeInfo;

    const book = {
      id: response.data.id,
      title: v.title ?? "",
      authors: v.authors ?? [],
      description: v.description ?? "",
      coverUrl: cleanGoogleBooksUrl(v.imageLinks?.thumbnail),
      rating: v.averageRating ?? null,
      ratingsCount: v.ratingsCount ?? null,
      pages: v.pageCount ?? null,
      publishedYear: v.publishedDate
        ? Number(v.publishedDate.slice(0, 4))
        : null,
      categories: v.categories ?? [],
      language: v.language ?? "en",
    };

    res.status(200).json(book);
  } catch (error) {
    if (error.response) {
      logger.error("Error obteniendo libro (Google API): " + error.response.status + " " + JSON.stringify(error.response.data));
      return res.status(error.response.status).json({ 
        message: "Error de la API de Google Books", 
        error: error.response.data 
      });
    }
    logger.error("Error obteniendo libro: " + error.message);
    res.status(500).json({ message: "Error obteniendo libro", error: error.message });
  }
};


// ------------------------
// Search History
// ------------------------
export const saveSearchHistory = async (req, res) => {
  try {
    const { query } = req.body;
    const userId = req.user.id;

    const exists = await SearchHistory.findOne({ user: userId, query });

    if (!exists) {
      await new SearchHistory({ query, user: userId }).save();
    }

    res.status(201).json({ ok: true });
  } catch (err) {
    console.error("Save search error:", err);
    res.status(500).json({ message: "Error saving history" });
  }
};



// ------------------------
// Get Search History
// ------------------------
export const getSearchHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await SearchHistory.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(history);
  } catch (err) {
    console.error("Get history error:", err);
    res.status(500).json({ message: "Error fetching history" });
  }
};


// ------------------------
// Delete Search History
// ------------------------
export const deleteSearchHistory = async (req, res) => {
  try{
    const userId = req.user.id;
    await SearchHistory.deleteMany({ user: userId });
    res.status(200).json({ ok: true, message: "Search history cleared" });
  }catch(err){
    console.error("Delete history error:", err);
    res.status(500).json({ message: "Error deleting history" });
  }
};


// ------------------------
// Delete single search history item
// ------------------------
export const deleteHistoryItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { query } = req.params; // Recibimos el query como parámetro de ruta

    if (!query) {
      return res.status(400).json({ message: "Query parameter required" });
    }

    await SearchHistory.deleteOne({ user: userId, query });

    res.status(200).json({ ok: true, deletedQuery: query });
  } catch (err) {
    console.error("Delete history item error:", err);
    res.status(500).json({ message: "Error deleting history item" });
  }
};


