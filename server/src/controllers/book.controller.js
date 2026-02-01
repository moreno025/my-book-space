import axios from "axios";
import SearchHistory from "../models/searchHistory.model.js";
import BookList from "../models/bookList.model.js";
import logger from "../utils/logger.js";
import { cleanGoogleBooksUrl } from "../utils/bookUtils.js";


// ------------------------
// Buscar libros
// ------------------------
export const searchBooks = async (req, res) => {
  try {
    const { q, orderBy, lang, page = 1 } = req.query;
    if (!q) return res.status(400).json({ message: "Debes proporcionar un término de búsqueda" });

    const maxResults = 20;
    const startIndex = (Math.max(1, parseInt(page)) - 1) * maxResults;

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
    // Fetch rich metadata from Google Books sequentially to avoid rate limits (503)
    const { lang } = req.query;
    const items = [];

    for (const hit of queryHits) {
      try {
        const response = await axios.get("https://www.googleapis.com/books/v1/volumes", {
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
        });

        const item = response.data.items?.[0];
        if (item && item.volumeInfo?.imageLinks?.thumbnail) {
            item.volumeInfo.imageLinks.thumbnail = cleanGoogleBooksUrl(item.volumeInfo.imageLinks.thumbnail, false);
            items.push(item);
        }

        // Small delay to be gentle with the API
        await new Promise(r => setTimeout(r, 300));

      } catch (err) {
        logger.error(`Error enrichment for trending book ${hit.q}: ${err.message}`);
      }
    }

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


// ------------------------
// Recommend Books (Wizard)
// ------------------------
// ------------------------
// Helper: Fetch NYT Books by Genre
// ------------------------
const fetchNytRecommendations = async (genre, lang) => {
    try {
        if (!process.env.NYT_BOOKS_API_KEY) return [];

        // Priority lists for each genre
        // We try the first one; if it fails or returns 0 items, we try the next.
        const genreMap = {
            "fiction": ["hardcover-fiction", "trade-fiction-paperback", "combined-print-and-e-book-fiction"],
            "mystery": ["crime-and-punishment", "hardcover-fiction"], 
            "thriller": ["crime-and-punishment", "hardcover-fiction"],
            "romance": ["mass-market-paperback", "trade-fiction-paperback", "combined-print-and-e-book-fiction"], 
            "nonfiction": ["hardcover-nonfiction", "papierback-nonfiction", "combined-print-and-e-book-nonfiction"],
            "biography": ["hardcover-nonfiction"], // "biographies" list sometimes exists but varies
            "science": ["science"],
            "history": ["hardcover-nonfiction"],
            "default": ["hardcover-fiction", "combined-print-and-e-book-fiction"]
        };

        const gKey = genre?.toLowerCase();
        const listsToTry = genreMap[gKey] || genreMap["default"];
        
        let rawBooks = [];
        let usedList = "";

        // Iterate through priority lists until we find books
        for (const listName of listsToTry) {
            try {
                const response = await axios.get(`https://api.nytimes.com/svc/books/v3/lists/current/${listName}.json`, {
                    params: { "api-key": process.env.NYT_BOOKS_API_KEY }
                });
                
                if (response.data.results?.books?.length > 0) {
                    rawBooks = response.data.results.books;
                    usedList = listName;
                    logger.info(`[NYT] Found ${rawBooks.length} items in list '${listName}' for genre '${genre}'`);
                    break; // Found books, stop trying other lists
                }
            } catch (err) {
                logger.warn(`[NYT] List '${listName}' failed or empty: ${err.message}`);
                // Continue to next list
            }
        }

        const nytBooks = rawBooks.slice(0, 5); // Start with Top 5
        
        // Enrich NYT data with Google Books
        const enrichedBooks = [];
        for (const book of nytBooks) {
             // Search using Title + Author is most precise
             const q = `intitle:"${book.title}" inauthor:"${book.author}"`;
             try {
                const gRes = await axios.get("https://www.googleapis.com/books/v1/volumes", {
                    params: {
                        q,
                        key: process.env.GOOGLE_BOOKS_API_KEY,
                        maxResults: 1,
                        printType: "books",
                        hl: lang.split('-')[0]
                    }
                });
                
                const item = gRes.data.items?.[0];
                if (item) {
                    // Inject NYT Metadata
                    item.isBestseller = true;
                    item.bestsellerInfo = {
                        rank: book.rank,
                        rankLastWeek: book.rank_last_week,
                        weeksOnList: book.weeks_on_list,
                        listName: usedList
                    };
                    enrichedBooks.push(item);
                }
             } catch (err) { }
        }
        
        return enrichedBooks;

    } catch (error) {
        logger.error(`NYT Recommendation failed: ${error.message} (Genre: ${genre})`);
        return [];
    }
};

// ------------------------
// Recommend Books (Wizard)
// ------------------------
export const recommendBooks = async (req, res) => {
  try {
    const { genres, mood, length } = req.body;
    const userId = req.user.id;
    const lang = req.query.lang || 'en';

    // 1. Build Google Query (Vibe Search)
    const moodMap = {
      happy: "humor comedy funny",
      dramatic: "drama emotional",
      thrilling: "thriller suspense tension",
      educational: "science history biography education",
      romantic: "romance love relationship",
      fantasy: "fantasy magic",
      scifi: "\"science fiction\" space future",
      mystery: "mystery detective crime"
    };

    let q = "";
    
    // Add Genres (Strict Category)
    // Make sure we handle "science fiction" with quotes if it comes as a genre
    if (genres && genres.length > 0) {
      const genreQuery = genres.map(g => {
          let cleanG = g.toLowerCase();
          if (cleanG === 'science fiction' || cleanG === 'scifi') cleanG = '"science fiction"';
          return `subject:${cleanG}`;
      }).join(" OR ");
      q += `(${genreQuery})`;
    }

    if (mood && moodMap[mood]) {
       const moodKeywords = moodMap[mood].split(" ").join(" OR ");
       q += (q ? " " : "") + `(${moodKeywords})`;
    }

    if (!q) q = "subject:fiction";

    // 2. Fetch User's Read Books to exclude
    const userLists = await BookList.find({ user: userId });
    const excludedBookIds = new Set();
    userLists.forEach(list => {
      list.books.forEach(book => excludedBookIds.add(book.googleBookId));
    });

    // 3. EXECUTE PARALLEL SEARCH: NYT (Quality) + Google (Vibe)
    logger.info(`[Recommendation] Starting Hybrid Search: Query='${q}'`);
    
    const primaryGenre = genres?.[0] || "fiction";

    const [googleResponse, nytItems] = await Promise.all([
        axios.get("https://www.googleapis.com/books/v1/volumes", {
            params: {
                q,
                key: process.env.GOOGLE_BOOKS_API_KEY,
                maxResults: 40,
                printType: "books",
                orderBy: "relevance", 
                hl: lang.split('-')[0]
            }
        }).catch(e => {
            logger.error(`Google Search Failed: ${e.message}`);
            return { data: { items: [] } };
        }),
        
        fetchNytRecommendations(primaryGenre, lang)
    ]);

    let googleItems = googleResponse.data?.items || [];
    logger.info(`[Recommendation] Raw Results - Google: ${googleItems.length}, NYT: ${nytItems.length}`);

    // FALLBACK for Google: If loose Vibe search fails, relax to strict Genre
    if (googleItems.length === 0 && mood && genres.length > 0) {
       const fallbackQ = genres.map(g => {
          let cleanG = g.toLowerCase();
          if (cleanG === 'science fiction' || cleanG === 'scifi') cleanG = '"science fiction"';
          return `subject:${cleanG}`;
       }).join(" OR ");

       logger.info(`[Recommendation] Google 0 results. Retrying fallback: ${fallbackQ}`);
       try {
         const fbRes = await axios.get("https://www.googleapis.com/books/v1/volumes", {
            params: { q: fallbackQ, key: process.env.GOOGLE_BOOKS_API_KEY, maxResults: 40, printType: "books", hl: lang.split('-')[0] }
          });
          googleItems = fbRes.data.items || [];
          logger.info(`[Recommendation] Fallback SUCCESS: Found ${googleItems.length} items`);
       } catch (e) { console.error('Fallback Error:', e.message); }
    }

    // 4. MERGE & DEDUPLICATE
    const allCandidates = [...nytItems, ...googleItems];
    const uniqueItems = [];
    const seenIds = new Set();

    for (const item of allCandidates) {
        if (!seenIds.has(item.id) && !excludedBookIds.has(item.id)) {
            seenIds.add(item.id);
            uniqueItems.push(item);
        }
    }


    // 5. Client-side Filtering (Length, etc)
    const filteredItems = uniqueItems.filter(item => {
      // Allow books without covers (we look them up)
      
      const pages = item.volumeInfo.pageCount || 0;
      // Note: NYT books might not have page counts if enrichment was partial, be lenient
      if (pages > 0) { 
        if (length === 'short' && pages > 350) return false;
        if (length === 'long' && pages < 500) return false;
        if (length === 'medium' && (pages < 300 || pages > 600)) return false;
      }
      return true;
    });

    // 6. Format
    const recommendations = filteredItems
      .slice(0, 10)
      .map(item => {
        // Safety check: ensure imageLinks object exists
        if (!item.volumeInfo.imageLinks) {
            item.volumeInfo.imageLinks = {};
        }
        item.volumeInfo.imageLinks.thumbnail = cleanGoogleBooksUrl(item.volumeInfo.imageLinks.thumbnail, false);
        return item;
      });

    logger.info(`[Recommendation] Final count: ${recommendations.length}`);
    try {
        return res.status(200).json({ recommendations });
    } catch (sendError) {
        logger.error(`Error sending response: ${sendError.message}`);
        return res.status(500).json({ message: "Error sending response" });
    }

  } catch (error) {
    logger.error("Error recommending books: " + error.message);
    // Ensure we don't send headers twice
    if (!res.headersSent) {
        res.status(500).json({ message: "Error generating recommendations", error: error.message });
    }
  }
};


