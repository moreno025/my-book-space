import BookList from "../models/bookList.model.js";
import User from "../models/user.model.js";
import Review from "../models/review.model.js";
import { cleanGoogleBooksUrl } from "../utils/bookUtils.js";

// ------------------------
// Create Book List
// ------------------------
export const createBookList = async (req, res) => {
    try {
        const { title, description, books, visibility } = req.body;
        
        const list = await BookList.create({ 
            title,
            description,
            visibility: visibility || "public",
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
        const { title, description, visibility } = req.body;

        const list = await BookList.findById(listId);
        if (!list) return res.status(404).json({ message: "Lista no encontrada" });
        if (!list.user.equals(req.user._id)) return res.status(403).json({ message: "No autorizado" });
        
        list.title = title ?? list.title;
        list.description = description ?? list.description;
        
        if (visibility) {
            list.visibility = visibility;
        }

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
        const { googleBookId, title, authors, thumbnail, publishedDate, categories } = req.body;

        const list = await BookList.findById(listId);
        if (!list) return res.status(404).json({ message: "Lista no encontrada" });
        if (!list.user.equals(req.user._id)) return res.status(403).json({ message: "No autorizado" });

        // Evitar duplicados
        if (list.books.some(b => b.googleBookId === googleBookId)) {
            return res.status(400).json({ message: "El libro ya está en la lista" });
        }
        
        const cleanThumbnail = cleanGoogleBooksUrl(thumbnail);
        
        list.books.push({ googleBookId, title, authors, thumbnail: cleanThumbnail, publishedDate, categories });
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
        const sourceList = await BookList.findById(listId).populate("user");

        if (!sourceList) return res.status(404).json({ message: "List not found" });

        const isOwner = req.user && sourceList.user._id.toString() === req.user._id.toString();
        
        // Check privacy/permissions
        if (!isOwner) {
            if (sourceList.visibility === 'private') {
                return res.status(403).json({ message: "Cannot copy a private list" });
            }
            
            // If the account is private, only followers can copy
            if (sourceList.user.isPrivate) {
                const isFollower = req.user && sourceList.user.followers.some(id => id.toString() === req.user._id.toString());
                if (!isFollower) {
                    return res.status(403).json({ message: "Only followers can copy lists from this private account" });
                }
            }
        }

        const existingCopy = await BookList.findOne({ user: req.user._id, sourceList: sourceList._id });
        if (existingCopy) {
            return res.status(400).json({ message: "You have already copied this list" });
        }

        const newList = await BookList.create({
            title: `${sourceList.title} (Copy)`,
            description: sourceList.description,
            visibility: "private", // Default to private for copies
            user: req.user._id,
            books: sourceList.books,
            sourceList: sourceList._id,
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
        
        const requester = req.user ? await User.findById(req.user._id) : null;
        const followingIds = requester ? requester.following.map(id => id.toString()) : [];

        // We use aggregation to filter by user privacy status too
        const pipeline = [
            { $match: { "books.title": { $regex: title, $options: "i" } } },
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            { $unwind: "$userDetails" },
            {
                $match: {
                    $or: [
                        // Mine
                        { user: requester ? requester._id : null },
                        // Public account AND public list
                        { 
                            "userDetails.isPrivate": false,
                            visibility: "public"
                        },
                        // Private account AND public list AND I am following
                        {
                            "userDetails.isPrivate": true,
                            visibility: "public",
                            "userDetails.followers": requester ? requester._id : null
                        }
                    ]
                }
            },
            {
                $project: {
                    title: 1,
                    description: 1,
                    books: 1,
                    visibility: 1,
                    savedBy: 1,
                    createdAt: 1,
                    user: {
                        _id: "$userDetails._id",
                        username: "$userDetails.username",
                        avatar: "$userDetails.avatar"
                    }
                }
            },
            { $addFields: { savedByCount: { $size: "$savedBy" } } },
            { $sort: { savedByCount: -1 } }
        ];

        const lists = await BookList.aggregate(pipeline);

        res.status(200).json({ lists });
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
        const requesterId = req.user ? req.user._id : null;

        const pipeline = [
            { $match: { visibility: "public", "books.googleBookId": googleBookId } },
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            { $unwind: "$userDetails" },
            {
                $match: {
                    $or: [
                        { "userDetails.isPrivate": false },
                        { 
                            "userDetails.isPrivate": true,
                            "userDetails.followers": requesterId 
                        },
                        { "userDetails._id": requesterId }
                    ]
                }
            },
            {
                $project: {
                    title: 1,
                    description: 1,
                    books: 1,
                    visibility: 1,
                    savedBy: 1,
                    createdAt: 1,
                    user: {
                        _id: "$userDetails._id",
                        username: "$userDetails.username",
                        avatar: "$userDetails.avatar"
                    }
                }
            }
        ];

        const lists = await BookList.aggregate(pipeline);

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

        const requesterId = req.user ? req.user._id.toString() : null;
        const isOwner = requesterId === user._id.toString();
        const isFollower = requesterId && user.followers.some(id => id.toString() === requesterId);
        const canViewFullProfile = !user.isPrivate || isFollower || isOwner;

        // Base query: only specific user's lists
        // If visiting profile, we usually want THEIR created lists.
        // If isOwner, we also show savedLists.
        let query = { user: user._id };
        
        if (!isOwner) {
            if (!canViewFullProfile) {
                return res.status(403).json({ message: "Account is private" });
            }
            query.visibility = "public";
        } else {
            // Owner can see their saved lists too
            query = {
                $or: [
                    { user: user._id },
                    { _id: { $in: user.savedLists } }
                ]
            };
        }

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
        const list = await BookList.findById(listId).populate("user");
        
        if (!list) return res.status(404).json({ message: "Lista no encontrada" });

        const requesterId = req.user ? req.user._id.toString() : null;
        const isOwner = requesterId === list.user._id.toString();
        
        // Privacy check
        if (!isOwner) {
            if (list.visibility === "private") {
                return res.status(403).json({ message: "No autorizado para ver esta lista" });
            }

            // Account privacy check
            if (list.user.isPrivate) {
                const isFollower = requesterId && list.user.followers.some(id => id.toString() === requesterId);
                if (!isFollower) {
                    return res.status(403).json({ message: "Account is private. Follow to view this list." });
                }
            }
        }

        // Add review counts if user is logged in
        let listWithReviewCounts = list.toObject();
        if (requesterId) {
            const bookIds = list.books.map(b => b.googleBookId);
            const reviews = await Review.find({
                user: requesterId,
                bookId: { $in: bookIds }
            });

            // Map review counts to books
            const reviewCountsMap = reviews.reduce((acc, rev) => {
                acc[rev.bookId] = (acc[rev.bookId] || 0) + 1;
                return acc;
            }, {});

            listWithReviewCounts.books = listWithReviewCounts.books.map(book => ({
                ...book,
                myReviewCount: reviewCountsMap[book.googleBookId] || 0
            }));
        }

        res.status(200).json({ list: listWithReviewCounts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obteniendo la lista" });
    }
};
