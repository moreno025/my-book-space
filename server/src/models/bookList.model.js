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
      categories: [String],
      readingStatus: {
        type: String,
        enum: ["not read", "reading", "read"],
        default: "not read"
      }
    }
    ],
    visibility: {
        type: String,
        enum: ["public", "private"],
        default: "public",
    },
    sourceList: { type: mongoose.Schema.Types.ObjectId, ref: "BookList" },
    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]

}, { timestamps: true });


export default mongoose.model("BookList", bookListSchema);