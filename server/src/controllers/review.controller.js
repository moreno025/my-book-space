import Review from "../models/review.model.js";

// ------------------------
// Create review
// ------------------------
export const createReview = async (req, res) => {
    try {
        const { bookId, rating, review, listId } = req.body;
        if (!bookId || !rating) return res.status(400).json({ message: "BookId y rating son obligatorios" });
    
        // Validar si ya existe reseña del mismo usuario para el mismo libro
        const existing = await Review.findOne({ bookId, user: req.user._id });
        if (existing) return res.status(400).json({ message: "Ya existe una reseña para este libro" });

        const newReview = await Review.create({
            user: req.user._id,
            bookId,
            rating,
            review,
            listId,
        });

    res.status(201).json({ message: "Reseña creada", review: newReview });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creando reseña" });
    }
};


// ------------------------
// Update review
// ------------------------
export const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, review } = req.body;

        const existing = await Review.findById(id);
        if (!existing) return res.status(404).json({ message: "Reseña no encontrada" });
        if (!existing.user.equals(req.user._id)) return res.status(403).json({ message: "No autorizado" });

        if (rating) existing.rating = rating;
        if (review) existing.review = review;

        await existing.save();
        res.status(200).json({ message: "Reseña actualizada", review: existing });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error actualizando reseña" });
    }
};


// ------------------------
// Delete review
// ------------------------
export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;

        const existing = await Review.findById(id);
        if (!existing) return res.status(404).json({ message: "Reseña no encontrada" });

        const isOwner = existing.user.equals(req.user._id);
        const isAdmin = req.user.role === "admin";

        if (!isOwner && !isAdmin) return res.status(403).json({ message: "No autorizado" });

        await existing.deleteOne();
        res.status(200).json({ message: "Reseña eliminada" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error eliminando reseña" });
    }
};


// ------------------------
// Get Book Reviews
// ------------------------
export const getBookReviews = async (req, res) => {
    try {
        const { bookId } = req.params;

        const reviews = await Review.find({ bookId }).populate("user", "username avatar");
        res.status(200).json({ reviews });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obteniendo reseñas" });
    }
};

