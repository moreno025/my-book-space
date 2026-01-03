import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    bookId: { type: String, required: true },
    authors: [String],
    listId: { type: mongoose.Schema.Types.ObjectId, ref: "BookList" },
    rating: { type: Number, min: 1, max: 5, required: true },
    review: { type: String, maxlength: 500 },
}, { timestamps: true });

export default mongoose.model("Review", reviewSchema);