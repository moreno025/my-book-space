import mongoose from "mongoose";

const readingChallengeSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    goalBooks: {
        type: Number,
        required: true,
        min: 1
    },
    goalPages: {
        type: Number,
        default: 0
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    presetType: {
        type: String,
        enum: ["year", "six_months", "custom"],
        default: "custom"
    },
    status: {
        type: String,
        enum: ["active", "completed", "expired"],
        default: "active"
    },
    genres: [{
        type: String
    }],
    booksRead: [{
        type: String // We'll store Google Book IDs
    }],
    pagesRead: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

export default mongoose.model("ReadingChallenge", readingChallengeSchema);
