import axios from "axios";
import SearchHistory from "../models/searchHistory.model.js";
import logger from "../utils/logger.js";
import { cleanGoogleBooksUrl } from "../utils/bookUtils.js";


// ------------------------
// Buscar libros
// ------------------------
export const searchBooks = async (req, res) => {
  try {
    const { q, orderBy, lang } = req.query;
    if (!q) return res.status(400).json({ message: "Debes proporcionar un término de búsqueda" });

    // Parallel search strategy
    const [broadResponse, titleResponse] = await Promise.all([
      axios.get("https://www.googleapis.com/books/v1/volumes", {
        params: {
          q,
          key: process.env.GOOGLE_BOOKS_API_KEY,
          maxResults: 20,
          printType: "books",
          orderBy: orderBy || "relevance",
          hl: (lang || 'en').split('-')[0],
        },
        headers: {
          'Accept-Language': lang || 'en'
        }
      }),
      axios.get("https://www.googleapis.com/books/v1/volumes", {
        params: {
          q: `intitle:"${q}"`,
          key: process.env.GOOGLE_BOOKS_API_KEY,
          maxResults: 20,
          printType: "books",
          orderBy: orderBy || "relevance",
          hl: (lang || 'en').split('-')[0],
        },
        headers: {
          'Accept-Language': lang || 'en'
        }
      })
    ]);

    const combinedItems = [
      ...(broadResponse.data.items ?? []),
      ...(titleResponse.data.items ?? [])
    ];

    const uniqueMap = new Map();
    combinedItems.forEach(item => {
      if (!uniqueMap.has(item.id)) {
        uniqueMap.set(item.id, item);
      }
    });

    const books = Array.from(uniqueMap.values())
      .filter(item => item.volumeInfo?.imageLinks?.thumbnail)
      .map(item => {
        // Use standard/reliable resolution for search results to prevent missing covers
        item.volumeInfo.imageLinks.thumbnail = cleanGoogleBooksUrl(item.volumeInfo.imageLinks.thumbnail, false);
        return item;
      });

    res.status(200).json({ 
      totalItems: uniqueMap.size,
      items: books 
    });
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
// Obtener libro por ISBN
// ------------------------
export const getBookByIsbn = async (req, res) => {
  try {
    const { isbn } = req.params;
    const { lang } = req.query;
    if (!isbn) return res.status(400).json({ message: "Debe proporcionar un ISBN" });

    // Primary search: exact ISBN
    let response = await axios.get("https://www.googleapis.com/books/v1/volumes", {
      params: {
        q: `isbn:${isbn}`,
        key: process.env.GOOGLE_BOOKS_API_KEY,
        maxResults: 1,
        hl: (lang || 'en').split('-')[0],
      },
      headers: {
        'Accept-Language': lang || 'en'
      }
    });

    // Fallback: If no exact ISBN match, try a general query with the ISBN string
    if (!response.data.items || response.data.items.length === 0) {
      response = await axios.get("https://www.googleapis.com/books/v1/volumes", {
        params: {
          q: isbn,
          key: process.env.GOOGLE_BOOKS_API_KEY,
          maxResults: 1,
          hl: (lang || 'en').split('-')[0],
        },
        headers: {
          'Accept-Language': lang || 'en'
        }
      });
    }

    if (!response.data.items || response.data.items.length === 0) {
      return res.status(404).json({ message: "No se encontró ningún libro con este ISBN" });
    }

    const item = response.data.items[0];
    const v = item.volumeInfo;

    const book = {
      id: item.id,
      title: v.title ?? "",
      authors: v.authors ?? [],
      description: v.description ?? "",
      coverUrl: cleanGoogleBooksUrl(v.imageLinks?.thumbnail, true),
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
      logger.error("Error obteniendo libro por ISBN (Google API): " + error.response.status + " " + JSON.stringify(error.response.data));
      return res.status(error.response.status).json({ 
        message: "Error de la API de Google Books", 
        error: error.response.data 
      });
    }
    logger.error("Error obteniendo libro por ISBN: " + error.message);
    res.status(500).json({ message: "Error obteniendo libro", error: error.message });
  }
};


// ------------------------
// Obtener libro por ID
// ------------------------
export const getBookById = async (req, res) => {
  try {
    const { googleBookId } = req.params;
    const { lang } = req.query;
    if (!googleBookId) return res.status(400).json({ message: "Debe proporcionar un ID de libro" });

    const response = await axios.get(`https://www.googleapis.com/books/v1/volumes/${googleBookId}`, {
      params: { 
        key: process.env.GOOGLE_BOOKS_API_KEY,
        hl: (lang || 'en').split('-')[0],
      },
      headers: {
        'Accept-Language': lang || 'en'
      }
    });

    const v = response.data.volumeInfo;

    const book = {
      id: response.data.id,
      title: v.title ?? "",
      authors: v.authors ?? [],
      description: v.description ?? "",
      // Use high-resolution (zoom=2) for detail screens
      coverUrl: cleanGoogleBooksUrl(v.imageLinks?.thumbnail, true),
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
// Get Trending Books (Curated/Authentic/Automated)
// ------------------------
export const getTrendingBooks = async (req, res) => {
  try {
    const nytKey = process.env.NYT_BOOKS_API_KEY;
    let queryHits = [];

    // Attempt to fetch live data from NYT if key is provided
    if (nytKey) {
      try {
        const nytResponse = await axios.get("https://api.nytimes.com/svc/books/v3/lists/current/hardcover-fiction.json", {
          params: { "api-key": nytKey }
        });
        
        const nytBooks = nytResponse.data.results?.books ?? [];
        if (nytBooks.length > 0) {
          queryHits = nytBooks.slice(0, 6).map(book => ({
            q: `intitle:"${book.title}" inauthor:"${book.author}"`
          }));
          logger.info(`Fetched ${queryHits.length} live bestsellers from NYT API`);
        }
      } catch (nytErr) {
        logger.error(`NYT API failed, falling back to curated list: ${nytErr.message}`);
      }
    }

    // Curated Fallback (Jan 2026) if NYT fails or no key is present
    if (queryHits.length === 0) {
      queryHits = [
        { q: 'intitle:"The Widow" inauthor:"John Grisham"' },
        { q: 'intitle:"The Secret of Secrets" inauthor:"Dan Brown"' },
        { q: 'intitle:"The Look" inauthor:"Michelle Obama"' },
        { q: 'intitle:"Mona\'s Eyes" inauthor:"Thomas Schlesser"' },
        { q: 'intitle:"1929" inauthor:"Andrew Ross Sorkin"' },
        { q: 'intitle:"How to Test Negative for Stupid" inauthor:"John Kennedy"' }
      ];
      logger.info("Using curated fallback list for trending books");
    }

    // Fetch rich metadata from Google Books in parallel for consistent app data
    const { lang } = req.query;
    const responses = await Promise.all(
      queryHits.map(hit => 
        axios.get("https://www.googleapis.com/books/v1/volumes", {
          params: {
            q: hit.q,
            key: process.env.GOOGLE_BOOKS_API_KEY,
            maxResults: 1,
            printType: "books",
            hl: (lang || 'en').split('-')[0],
          },
          headers: {
            'Accept-Language': lang || 'en'
          }
        }).catch(err => {
          logger.error(`Error enrichment for trending book ${hit.q}: ${err.message}`);
          return { data: { items: [] } };
        })
      )
    );

    const items = responses
      .map(r => r.data.items?.[0])
      .filter(item => item && item.volumeInfo?.imageLinks?.thumbnail)
      .map(item => {
        // Use standard resolution for home carousels
        item.volumeInfo.imageLinks.thumbnail = cleanGoogleBooksUrl(item.volumeInfo.imageLinks.thumbnail, false);
        return item;
      });

    res.status(200).json({ items });
  } catch (error) {
    logger.error("Error fetching trending books: " + error.message);
    res.status(500).json({ message: "Error fetching trending books", error: error.message });
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


