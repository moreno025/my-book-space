import mongoose from "mongoose";

const userSearchHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  searchedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

// Index to quickly fetch history for a user, sorted by date
userSearchHistorySchema.index({ user: 1, createdAt: -1 });

// Ensure unique entries per user-searchedUser pair (optional, but good for history to just update timestamp)
// Actually, for history we usually want the latest one to bubble up.
// So we will handle upsert in controller.

export default mongoose.model("UserSearchHistory", userSearchHistorySchema);
