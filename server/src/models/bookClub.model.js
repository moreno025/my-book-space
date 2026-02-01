import mongoose from "mongoose";

const bookClubSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        default: "",
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    pendingInvites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    visibility: {
        type: String,
        enum: ["public", "private"],
        default: "public",
    },
    avatar: {
        type: String,
        default: "",
    },
    currentBook: {
        googleBookId: String,
        title: String,
        authors: [String],
        thumbnail: String,
        startDate: Date,
        endDate: Date,
    },
    pastBooks: [{
        googleBookId: String,
        title: String,
        authors: [String],
        thumbnail: String,
        startDate: Date,
        endDate: Date,
        archivedAt: {
            type: Date,
            default: Date.now,
        }
    }],
    sharedBooks: [{
        googleBookId: String,
        title: String,
        authors: [String],
        thumbnail: String,
        sharedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        sharedAt: {
            type: Date,
            default: Date.now,
        },
    }],
    avatar: {
        type: String,
        default: "",
    },
}, { timestamps: true });

export default mongoose.model("BookClub", bookClubSchema);
