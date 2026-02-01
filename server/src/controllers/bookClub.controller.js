import BookClub from "../models/bookClub.model.js";
import User from "../models/user.model.js";
import ClubMessage from "../models/clubMessage.model.js";
import { cleanGoogleBooksUrl } from "../utils/bookUtils.js";

// ------------------------
// Create Book Club
// ------------------------
export const createBookClub = async (req, res) => {
    try {
        const { name, description, visibility } = req.body;

        const club = await BookClub.create({
            name,
            description,
            visibility: visibility || "public",
            admin: req.user._id,
            members: [req.user._id], // Admin is automatically a member
        });

        // Create system message
        await ClubMessage.create({
            club: club._id,
            sender: req.user._id,
            content: `${req.user.username} created this club`,
            type: "system",
        });

        res.status(201).json({ message: "Club created", club });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating club" });
    }
};

// ------------------------
// Get User's Clubs
// ------------------------
export const getUserClubs = async (req, res) => {
    try {
        const clubs = await BookClub.find({
            members: req.user._id,
        })
            .populate("admin", "username avatar")
            .populate("members", "username avatar")
            .sort({ updatedAt: -1 });

        res.status(200).json({ clubs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching clubs" });
    }
};

// ------------------------
// Discover Public Clubs
// ------------------------
export const discoverClubs = async (req, res) => {
    try {
        const clubs = await BookClub.find({
            visibility: "public",
            members: { $ne: req.user._id }, // Exclude clubs user is already in
        })
            .populate("admin", "username avatar")
            .select("name description avatar members currentBook createdAt")
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json({ clubs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error discovering clubs" });
    }
};

// ------------------------
// Get Club Details
// ------------------------
export const getClubById = async (req, res) => {
    try {
        const { clubId } = req.params;
        const club = await BookClub.findById(clubId)
            .populate("admin", "username avatar")
            .populate("members", "username avatar")
            .populate("pendingInvites", "username avatar");

        if (!club) return res.status(404).json({ message: "Club not found" });

        // Check if user is a member
        const isMember = club.members.some(member => member._id.equals(req.user._id));
        const isAdmin = club.admin._id.equals(req.user._id);

        if (!isMember && club.visibility === "private") {
            return res.status(403).json({ message: "This club is private" });
        }

        // Clean book thumbnails
        if (club.currentBook?.thumbnail) {
            club.currentBook.thumbnail = cleanGoogleBooksUrl(club.currentBook.thumbnail);
        }
        club.sharedBooks = club.sharedBooks.map(book => ({
            ...book.toObject(),
            thumbnail: cleanGoogleBooksUrl(book.thumbnail),
        }));

        res.status(200).json({ club, isMember, isAdmin });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching club" });
    }
};

// ------------------------
// Update Club
// ------------------------
export const updateClub = async (req, res) => {
    try {
        const { clubId } = req.params;
        const { name, description, visibility, avatar } = req.body;

        const club = await BookClub.findById(clubId);
        if (!club) return res.status(404).json({ message: "Club not found" });
        if (!club.admin.equals(req.user._id)) return res.status(403).json({ message: "Only admin can update club" });

        club.name = name ?? club.name;
        club.description = description ?? club.description;
        club.visibility = visibility ?? club.visibility;
        
        if (req.file) {
            club.avatar = `/uploads/clubs/${req.file.filename}`;
        } else if (avatar !== undefined) {
             club.avatar = avatar;
        }

        await club.save();
        res.status(200).json({ message: "Club updated", club });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating club" });
    }
};

// ------------------------
// Delete Club
// ------------------------
export const deleteClub = async (req, res) => {
    try {
        const { clubId } = req.params;
        const club = await BookClub.findById(clubId);

        if (!club) return res.status(404).json({ message: "Club not found" });
        if (!club.admin.equals(req.user._id)) return res.status(403).json({ message: "Only admin can delete club" });

        // Delete all messages
        await ClubMessage.deleteMany({ club: clubId });

        await club.deleteOne();
        res.status(200).json({ message: "Club deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting club" });
    }
};

// ------------------------
// Join Club
// ------------------------
export const joinClub = async (req, res) => {
    try {
        const { clubId } = req.params;
        const club = await BookClub.findById(clubId);

        if (!club) return res.status(404).json({ message: "Club not found" });

        if (club.members.includes(req.user._id)) {
            return res.status(400).json({ message: "Already a member" });
        }

        if (club.visibility === "private") {
            // Add to pending invites
            if (!club.pendingInvites.includes(req.user._id)) {
                club.pendingInvites.push(req.user._id);
                await club.save();
            }
            return res.status(200).json({ message: "Join request sent" });
        }

        // Public club - join immediately
        club.members.push(req.user._id);
        await club.save();

        // Create system message
        await ClubMessage.create({
            club: club._id,
            sender: req.user._id,
            content: `${req.user.username} joined the club`,
            type: "system",
        });

        res.status(200).json({ message: "Joined club", club });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error joining club" });
    }
};

// ------------------------
// Leave Club
// ------------------------
export const leaveClub = async (req, res) => {
    try {
        const { clubId } = req.params;
        const club = await BookClub.findById(clubId);

        if (!club) return res.status(404).json({ message: "Club not found" });

        if (club.admin.equals(req.user._id)) {
            return res.status(403).json({ message: "Admin cannot leave. Transfer admin or delete club." });
        }

        club.members = club.members.filter(id => !id.equals(req.user._id));
        await club.save();

        // Create system message
        await ClubMessage.create({
            club: club._id,
            sender: req.user._id,
            content: `${req.user.username} left the club`,
            type: "system",
        });

        res.status(200).json({ message: "Left club" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error leaving club" });
    }
};

// ------------------------
// Approve Join Request
// ------------------------
export const approveJoinRequest = async (req, res) => {
    try {
        const { clubId, userId } = req.params;
        const club = await BookClub.findById(clubId);

        if (!club) return res.status(404).json({ message: "Club not found" });
        if (!club.admin.equals(req.user._id)) return res.status(403).json({ message: "Only admin can approve requests" });

        if (!club.pendingInvites.includes(userId)) {
            return res.status(400).json({ message: "No pending request from this user" });
        }

        club.pendingInvites = club.pendingInvites.filter(id => id.toString() !== userId);
        club.members.push(userId);
        await club.save();

        const user = await User.findById(userId);

        // Create system message
        await ClubMessage.create({
            club: club._id,
            sender: userId,
            content: `${user.username} joined the club`,
            type: "system",
        });

        res.status(200).json({ message: "User approved", club });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error approving request" });
    }
};

// ------------------------
// Remove Member
// ------------------------
export const removeMember = async (req, res) => {
    try {
        const { clubId, userId } = req.params;
        const club = await BookClub.findById(clubId);

        if (!club) return res.status(404).json({ message: "Club not found" });
        if (!club.admin.equals(req.user._id)) return res.status(403).json({ message: "Only admin can remove members" });

        if (club.admin.toString() === userId) {
            return res.status(403).json({ message: "Cannot remove admin" });
        }

        club.members = club.members.filter(id => id.toString() !== userId);
        await club.save();

        const user = await User.findById(userId);

        // Create system message
        await ClubMessage.create({
            club: club._id,
            sender: req.user._id,
            content: `${user.username} was removed from the club`,
            type: "system",
        });

        res.status(200).json({ message: "Member removed", club });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error removing member" });
    }
};

// ------------------------
// Invite User (Direct Add)
// ------------------------
export const inviteUser = async (req, res) => {
    try {
        const { clubId } = req.params;
        const { userId } = req.body;

        const club = await BookClub.findById(clubId);
        if (!club) return res.status(404).json({ message: "Club not found" });
        if (!club.admin.equals(req.user._id)) return res.status(403).json({ message: "Only admin can invite users" });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (club.members.includes(userId)) {
            return res.status(400).json({ message: "User is already a member" });
        }

        // Add to members
        club.members.push(userId);
        
        // Remove from pending invites if they were there
        if (club.pendingInvites && club.pendingInvites.includes(userId)) {
            club.pendingInvites = club.pendingInvites.filter(id => id.toString() !== userId);
        }

        await club.save();

        // Create system message
        await ClubMessage.create({
            club: club._id,
            sender: req.user._id,
            content: `${req.user.username} added ${user.username} to the club`,
            type: "system",
        });

        res.status(200).json({ message: "User added to club", club });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error inviting user" });
    }
};

// ------------------------
// Set Current Discussion Book
// ------------------------
export const setCurrentBook = async (req, res) => {
    try {
        const { clubId } = req.params;
        const { googleBookId, title, authors, thumbnail, startDate, endDate } = req.body;

        const club = await BookClub.findById(clubId);
        if (!club) return res.status(404).json({ message: "Club not found" });
        if (!club.admin.equals(req.user._id)) return res.status(403).json({ message: "Only admin can set discussion book" });

        // Archive current book if it exists
        if (club.currentBook && club.currentBook.title) {
            club.pastBooks.push({
                googleBookId: club.currentBook.googleBookId,
                title: club.currentBook.title,
                authors: club.currentBook.authors,
                thumbnail: club.currentBook.thumbnail,
                startDate: club.currentBook.startDate,
                endDate: club.currentBook.endDate,
                archivedAt: new Date(),
            });
        }

        club.currentBook = {
            googleBookId,
            title,
            authors,
            thumbnail: cleanGoogleBooksUrl(thumbnail),
            startDate,
            endDate,
        };

        await club.save();

        // Create system message
        await ClubMessage.create({
            club: club._id,
            sender: req.user._id,
            content: `${req.user.username} set "${title}" as the current discussion book`,
            type: "system",
        });

        res.status(200).json({ message: "Discussion book set", club });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error setting discussion book" });
    }
};

// ------------------------
// Share Book Recommendation
// ------------------------
export const shareBook = async (req, res) => {
    try {
        const { clubId } = req.params;
        const { googleBookId, title, authors, thumbnail } = req.body;

        const club = await BookClub.findById(clubId);
        if (!club) return res.status(404).json({ message: "Club not found" });

        const isMember = club.members.some(id => id.equals(req.user._id));
        if (!isMember) return res.status(403).json({ message: "Only members can share books" });

        club.sharedBooks.push({
            googleBookId,
            title,
            authors,
            thumbnail: cleanGoogleBooksUrl(thumbnail),
            sharedBy: req.user._id,
        });

        await club.save();

        // Create message with book share
        const message = await ClubMessage.create({
            club: club._id,
            sender: req.user._id,
            content: `Shared a book: ${title}`,
            type: "book_share",
            bookData: {
                googleBookId,
                title,
                authors,
                thumbnail: cleanGoogleBooksUrl(thumbnail),
            },
        });

        res.status(200).json({ message: "Book shared", club, chatMessage: message });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error sharing book" });
    }
};
