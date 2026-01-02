import BookList from "../models/bookList.model.js";
import User from "../models/user.model.js";
import { cleanGoogleBooksUrl } from "../utils/bookUtils.js";

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
        
        const cleanThumbnail = cleanGoogleBooksUrl(thumbnail);
        
        list.books.push({ googleBookId, title, authors, thumbnail: cleanThumbnail, publishedDate });
        await list.save();

        res.status(200).json({ message: "Libro añadido a la lista", list });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error añadiendo libro" });
    }
};

// ------------------------
// Copy Book List
// ------------------------
export const copyBookList = async (req, res) => {
    try {
        const { listId } = req.params;
        const sourceList = await BookList.findById(listId);

        if (!sourceList) return res.status(404).json({ message: "List not found" });

        // Check privacy/permissions (reuse getUserLists logic essentially)
        // If public, anyone can copy. If private, only followers or owner.
        // Simplified: if isPublic or owner.
        // We can trust the frontend to only show this for reachable lists, 
        // but robust check:
        const isOwner = sourceList.user.equals(req.user._id);
        if (!sourceList.isPublic && !isOwner) {
             // TODO: Check following status strictly if we want to be 100% secure, 
             // but for now, assuming if they can see it (via getListById permissions), they can copy it.
             // Let's just rely on getListById-like implicit 'can view' check or standard privacy.
             // For strictness:
             const sourceUser = await User.findById(sourceList.user);
             const canAccess = !sourceUser.isPrivate || sourceUser.followers.includes(req.user._id);
             if (!canAccess) return res.status(403).json({ message: "Not authorized to copy this list" });
        }

        const newList = await BookList.create({
            title: `${sourceList.title} (Copy)`,
            description: sourceList.description,
            isPublic: false, // Default to private for copies
            user: req.user._id,
            books: sourceList.books,
        });

        res.status(201).json({ message: "List copied successfully", list: newList });
    } catch (error) {
        console.error("Error copying list:", error);
        res.status(500).json({ message: "Error copying list" });
    }
};
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
// Get Lists By Book Id (Discovery)
// ------------------------
export const getListsByBookId = async (req, res) => {
    try {
        const { googleBookId } = req.params;

        const lists = await BookList.find({
            isPublic: true,
            "books.googleBookId": googleBookId
        }).populate("user", "username avatar");

        res.status(200).json({ lists });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obteniendo listas del libro" });
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

// ------------------------
// Unsave List
// ------------------------
export const unsaveList = async (req, res) => {
    try {
        const { listId } = req.params;
        const user = await User.findById(req.user._id);

        user.savedLists = user.savedLists.filter(id => id.toString() !== listId);
        await user.save();

        const list = await BookList.findById(listId);
        if (list) {
            list.savedBy = list.savedBy.filter(id => id.toString() !== req.user._id.toString());
            await list.save();
        }

        res.status(200).json({ message: "Lista eliminada de tus guardados" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al dejar de guardar la lista" });
    }
};




// ------------------------
// Get User Lists
// ------------------------
export const getUserLists = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isOwner = req.user._id.toString() === user._id.toString();

        let query = {
            $or: [
                { user: user._id },
                { _id: { $in: user.savedLists } }
            ]
        };
        
        // Si el usuario logueado NO es el dueño del perfil, solo mostrar listas públicas
        if (!isOwner) {
            query.isPublic = true;
        }

        // Ordenar por las más recientes, poblar el owner para discovery
        const lists = await BookList.find(query).populate("user", "username avatar").sort({ createdAt: -1 });

        res.status(200).json({ lists });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obteniendo listas del usuario" });
    }
};

// ------------------------
// Get List By ID
// ------------------------
export const getListById = async (req, res) => {
    try {
        const { listId } = req.params;
        const list = await BookList.findById(listId).populate("user", "username avatar");
        
        if (!list) return res.status(404).json({ message: "Lista no encontrada" });

        // Si es privada, solo el dueño puede verla
        if (!list.isPublic && !list.user._id.equals(req.user._id)) {
            return res.status(403).json({ message: "No autorizado para ver esta lista" });
        }

        res.status(200).json({ list });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obteniendo la lista" });
    }
};
