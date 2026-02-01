import mongoose from "mongoose";

const clubMessageSchema = new mongoose.Schema({
    club: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BookClub",
        required: true,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ["text", "book_share", "system"],
        default: "text",
    },
    bookData: {
        googleBookId: String,
        title: String,
        authors: [String],
        thumbnail: String,
    },
    isPinned: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

// Index for efficient querying
clubMessageSchema.index({ club: 1, createdAt: -1 });

export default mongoose.model("ClubMessage", clubMessageSchema);
