import mongoose from "mongoose";

const bookListSchema = new mongoose.Schema({
    title: {
    type: String,
    required: true,
    },
    description: {
        type: String,
        default: "",
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    books: [
    {
      googleBookId: String,
      title: String,
      authors: [String],
      thumbnail: String,
      publishedDate: String,
    }
    ],
    isPublic: {
        type: Boolean,
        default: true,
    },
    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]

}, { timestamps: true });


export default mongoose.model("BookList", bookListSchema);