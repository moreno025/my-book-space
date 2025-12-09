import dotenv from "dotenv";
dotenv.config();
import axios from "axios";

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
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error buscando libros:", error.message);
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

    res.status(200).json({ book: response.data });
  } catch (error) {
    console.error("Error obteniendo libro:", error.message);
    res.status(500).json({ message: "Error obteniendo libro", error: error.message });
  }
};
