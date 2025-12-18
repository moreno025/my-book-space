import mongoose from "mongoose";

const searchHistorySchema = new mongoose.Schema({
  query: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

searchHistorySchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("SearchHistory", searchHistorySchema);
