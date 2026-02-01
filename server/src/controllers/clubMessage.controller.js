import ClubMessage from "../models/clubMessage.model.js";
import BookClub from "../models/bookClub.model.js";

// ------------------------
// Get Club Messages
// ------------------------
export const getClubMessages = async (req, res) => {
    try {
        const { clubId } = req.params;
        const { limit = 50, before } = req.query;

        const club = await BookClub.findById(clubId);
        if (!club) return res.status(404).json({ message: "Club not found" });

        const isMember = club.members.some(id => id.equals(req.user._id));
        if (!isMember) return res.status(403).json({ message: "Only members can view messages" });

        const query = { club: clubId };
        if (before) {
            query.createdAt = { $lt: new Date(before) };
        }

        const messages = await ClubMessage.find(query)
            .populate("sender", "username avatar")
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.status(200).json({ messages: messages.reverse() });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching messages" });
    }
};

// ------------------------
// Send Message
// ------------------------
export const sendMessage = async (req, res) => {
    try {
        const { clubId } = req.params;
        const { content, type = "text", bookData } = req.body;

        const club = await BookClub.findById(clubId);
        if (!club) return res.status(404).json({ message: "Club not found" });

        const isMember = club.members.some(id => id.equals(req.user._id));
        if (!isMember) return res.status(403).json({ message: "Only members can send messages" });

        const message = await ClubMessage.create({
            club: clubId,
            sender: req.user._id,
            content,
            type,
            bookData,
        });

        const populatedMessage = await ClubMessage.findById(message._id).populate("sender", "username avatar");

        // Socket.io will handle broadcasting
        // The socket handler will emit this message to the room

        res.status(201).json({ message: "Message sent", data: populatedMessage });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error sending message" });
    }
};

// ------------------------
// Pin/Unpin Message
// ------------------------
export const togglePinMessage = async (req, res) => {
    try {
        const { clubId, messageId } = req.params;

        const club = await BookClub.findById(clubId);
        if (!club) return res.status(404).json({ message: "Club not found" });
        if (!club.admin.equals(req.user._id)) return res.status(403).json({ message: "Only admin can pin messages" });

        const message = await ClubMessage.findById(messageId);
        if (!message) return res.status(404).json({ message: "Message not found" });
        if (!message.club.equals(clubId)) return res.status(400).json({ message: "Message not in this club" });

        message.isPinned = !message.isPinned;
        await message.save();

        res.status(200).json({ message: "Message pin toggled", data: message });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error toggling pin" });
    }
};

// ------------------------
// Delete Message
// ------------------------
export const deleteMessage = async (req, res) => {
    try {
        const { clubId, messageId } = req.params;

        const club = await BookClub.findById(clubId);
        if (!club) return res.status(404).json({ message: "Club not found" });

        const message = await ClubMessage.findById(messageId);
        if (!message) return res.status(404).json({ message: "Message not found" });

        const isAdmin = club.admin.equals(req.user._id);
        const isSender = message.sender.equals(req.user._id);

        if (!isAdmin && !isSender) {
            return res.status(403).json({ message: "Only sender or admin can delete messages" });
        }

        await message.deleteOne();

        res.status(200).json({ message: "Message deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting message" });
    }
};
