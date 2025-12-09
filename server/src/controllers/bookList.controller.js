import BookList from "../models/bookList.model.js";
import User from "../models/user.model.js";

// ------------------------
// Create Book List
// ------------------------
export const createBookList = async (req, res) => {
    try {
        const { title, description, books, isPublic } = req.body;
        
        const list = await BookList.create({ 
            title,
            description,
            isPublic: isPublic ?? true,
            user: req.user._id,
            books: [],
        });

        res.status(201).json({ message: "Lista creada", list });        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creando la lista" });
    }
};


// ------------------------
// Edit Book List
// ------------------------
export const updateList = async (req, res) => {
    try {
        const { listId } = req.params;
        const { title, description, isPublic } = req.body;

        const list = await BookList.findById(listId);
        if (!list) return res.status(404).json({ message: "Lista no encontrada" });
        if (!list.user.equals(req.user._id)) return res.status(403).json({ message: "No autorizado" });
        
        list.title = title ?? list.title;
        list.description = description ?? list.description;
        if (typeof isPublic === "boolean") list.isPublic = isPublic;

        await list.save();
        res.status(200).json({ message: "Lista actualizada", list });        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error actualizando la lista" });
    }
};


// ------------------------
// Delete Book List
// ------------------------
export const deleteList = async (req, res) => {
    try{
        const { listId } = req.params;
        const list = await BookList.findById(listId);
        if (!list) return res.status(404).json({ message: "Lista no encontrada" });
        if (!list.user.equals(req.user._id)) return res.status(403).json({ message: "No autorizado" });

        await list.deleteOne();
        res.status(200).json({ message: "Lista eliminada" });
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Error eliminando la lista" });
    }
};


// ------------------------
// Add Book to List
// ------------------------
export const addBookToList = async (req, res) => {
    try {
        const { listId } = req.params;
        const { googleBookId, title, authors, thumbnail, publishedDate } = req.body;

        const list = await BookList.findById(listId);
        if (!list) return res.status(404).json({ message: "Lista no encontrada" });
        if (!list.user.equals(req.user._id)) return res.status(403).json({ message: "No autorizado" });

        // Evitar duplicados
        if (list.books.some(b => b.googleBookId === googleBookId)) {
            return res.status(400).json({ message: "El libro ya está en la lista" });
        }
        
        list.books.push({ googleBookId, title, authors, thumbnail, publishedDate });
        await list.save();

        res.status(200).json({ message: "Libro añadido a la lista", list });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error añadiendo libro" });
    }
};


// ------------------------
// Search List By Book
// ------------------------
export const searchListsByBook = async (req, res) => {
    try {
        const { title } = req.params;
    if (!title) return res.status(400).json({ message: "No se proporciono un titulo" });
    
    // Buscar listas que contengan libros cuyo título coincida
    // Lista pública
    const publicLists = await BookList.find({
      isPublic: true,
      "books.title": { $regex: title, $options: "i" },
    }).populate("user", "username avatar");

    let privateLists = [];
    if (req.user) {
      // Listas privadas de usuarios a los que sigo o mis listas
      const user = await User.findById(req.user._id);
      const followingIds = user.following;

      privateLists = await BookList.find({
        isPublic: false,
        user: { $in: [...followingIds, req.user._id] },
        "books.title": { $regex: title, $options: "i" },
      }).populate("user", "username avatar");
    }

    const allLists = [...publicLists, ...privateLists];

    allLists.sort((a, b) => b.savedBy.length - a.savedBy.length);

    res.status(200).json({ lists: allLists });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error buscando listas" });
    }
};


// ------------------------
// Remove Book From List
// ------------------------
export const removeBookFromList = async (req, res) => {
  try {
    const { listId, googleBookId } = req.params;

    const list = await BookList.findById(listId);
    if (!list) return res.status(404).json({ message: "Lista no encontrada" });
    if (!list.user.equals(req.user._id)) return res.status(403).json({ message: "No autorizado" });

    list.books = list.books.filter(b => b.googleBookId !== googleBookId);
    await list.save();

    res.status(200).json({ message: "Libro eliminado de la lista", list });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error eliminando libro" });
  }
};


// ------------------------
// Save List
// ------------------------
export const saveList = async (req, res) => {
  try {
    const { listId } = req.params;
    const user = await User.findById(req.user._id);

    if (user.savedLists.includes(listId)) {
      return res.status(400).json({ message: "Lista ya guardada" });
    }

    user.savedLists.push(listId);
    await user.save();

    const list = await BookList.findById(listId);
    if (!list.savedBy.includes(req.user._id)) {
      list.savedBy.push(req.user._id);
      await list.save();
    }

    res.status(200).json({ message: "Lista guardada", list });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error guardando lista" });
  }
};



