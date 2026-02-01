import User from "../models/user.model.js";
import BookList from "../models/bookList.model.js";
import Review from "../models/review.model.js";
import UserSearchHistory from "../models/userSearchHistory.model.js";
import ReadingChallenge from "../models/readingChallenge.model.js";


// ------------------------
// Follow User
// ------------------------
export const followUser = async (req, res) => {
    try {
        const userToFollowId = req.params.id;
        const currentUserId = req.user.id;

        if (userToFollowId === currentUserId) {
            return res.status(400).json({ message: "No puedes seguirte a ti mismo" });
        }

        const userToFollow = await User.findById(userToFollowId);
        const currentUser = await User.findById(currentUserId);

        if(!userToFollow || !currentUser) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        if(currentUser.following.includes(userToFollowId)) {
            return res.status(400).json({ message: "Ya sigues a este usuario" });
        }

        if (userToFollow.followRequests && userToFollow.followRequests.includes(currentUserId)) {
            return res.status(400).json({ message: "Solicitud de seguimiento ya enviada" });
        }

        // If target is private, add to requests
        if (userToFollow.isPrivate) {
            userToFollow.followRequests.push(currentUserId);
            await userToFollow.save();
            return res.status(200).json({ 
                message: "Solicitud de seguimiento enviada", 
                requested: true,
                isFollowing: false 
            });
        }

        // If target is public, follow immediately
        currentUser.following.push(userToFollowId);
        userToFollow.followers.push(currentUserId);
        await currentUser.save();
        await userToFollow.save();

        res.status(200).json({ 
            message: "Usuario seguido correctamente", 
            requested: false,
            isFollowing: true 
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
};


// ------------------------
// Unfollow User
// ------------------------
export const unfollowUser = async (req, res) => {
    try {
        const userToUnfollowId = req.params.id;
        const currentUserId = req.user.id;

        if (userToUnfollowId === currentUserId) {
            return res.status(400).json({ message: "No puedes dejar de seguirte a ti mismo" });
        }

        if (!userToUnfollowId) {
            return res.status(400).json({ message: "ID de usuario requerido" });
        }

        const userToUnfollow = await User.findById(userToUnfollowId);
        const currentUser = await User.findById(currentUserId);

        if(!userToUnfollow || !currentUser) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Also handle removing pending requests
        if (userToUnfollow.followRequests && userToUnfollow.followRequests.includes(currentUserId)) {
            userToUnfollow.followRequests.pull(currentUserId);
            await userToUnfollow.save();
            return res.status(200).json({ message: "Solicitud de seguimiento cancelada" });
        }

        if(!currentUser.following.includes(userToUnfollowId)) {
            return res.status(400).json({ message: "No sigues a este usuario" });
        }

        currentUser.following.pull(userToUnfollowId);
        userToUnfollow.followers.pull(currentUserId);
        await currentUser.save();
        await userToUnfollow.save();

        res.status(200).json({ message: "Usuario dejado de seguir correctamente" });

    } catch (error) {
        console.error("Error dejando de seguir:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};


// ------------------------
// Get Followers
// ------------------------
export const getFollowers = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId)
            .populate("followers", "username name avatar");

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.status(200).json({
            followers: user.followers,
            count: user.followers.length,
        });
        
    } catch (error) {
        console.error("Error obteniendo seguidores:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};


// ------------------------
// Get Followings
// ------------------------
export const getFollowing = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId)
            .populate("following", "username name avatar");

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.status(200).json({
            followings: user.following,
            count: user.following.length,
        });
        
    } catch (error) {
        console.error("Error obteniendo seguidos:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};


// ------------------------
// Search Users
// ------------------------
export const searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ message: "Proporcione un término de búsqueda" });

        const users = await User.find({
            $or: [
                { username: { $regex: q, $options: "i" } },
                { name: { $regex: q, $options: "i" } }
            ],
            _id: { $ne: req.user.id } // Exclude current user
        })
        .select("username name avatar isPrivate")
        .limit(20);

        res.status(200).json({ users });

    } catch (error) {
        console.error("Error buscando usuarios:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};


// ------------------------
// Get User
// ------------------------
export const getUser = async (req, res) => {
    try{
        const { username } = req.params;
        const currentUserId = req.user?.id;

        const user = await User.findOne({ username })
            .select("username name lastName bio avatar followers following followRequests isPrivate");

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        const isFollowing = currentUserId ? user.followers.includes(currentUserId) : false;
        const isRequested = currentUserId ? (user.followRequests && user.followRequests.includes(currentUserId)) : false;
        const isSelf = currentUserId === user._id.toString();

        // Privacy check
        const canViewFullProfile = !user.isPrivate || isFollowing || isSelf;

        res.status(200).json({
            id: user._id,
            username: user.username,
            name: user.name,
            lastName: user.lastName,
            bio: canViewFullProfile ? user.bio : null,
            avatar: user.avatar,
            followersCount: user.followers.length,
            followingCount: user.following.length,
            isPrivate: user.isPrivate,
            isFollowing,
            isRequested,
            canViewFullProfile
        });

    }catch(error){
        console.error("Error obteniendo usuario:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};


// ------------------------
// Get User Reviews
// ------------------------
export const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await Review.find({ user: userId }).populate("user", "username avatar");
    res.status(200).json({ reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo reseñas del usuario" });
  }
};


// ------------------------
// User Search History
// ------------------------

export const saveUserSearchHistory = async (req, res) => {
    try {
        const { searchedUserId } = req.body;
        const currentUserId = req.user.id;

        if (!searchedUserId) return res.status(400).json({ message: "No searched user ID provided" });
        if (currentUserId === searchedUserId) return res.status(200).json({ ok: true }); // Don't save self-clicks

        // Upsert: if exists, delete and create new to update timestamp and move to top
        await UserSearchHistory.deleteOne({ user: currentUserId, searchedUser: searchedUserId });
        await new UserSearchHistory({ user: currentUserId, searchedUser: searchedUserId }).save();

        res.status(200).json({ ok: true });
    } catch (error) {
        console.error("Error saving user search history:", error);
        res.status(500).json({ message: "Error saving history" });
    }
};

export const getUserSearchHistory = async (req, res) => {
    try {
        console.log("[DEBUG] getUserSearchHistory called"); // DEBUG LOG
        const currentUserId = req.user.id;
        const history = await UserSearchHistory.find({ user: currentUserId })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate("searchedUser", "username name avatar");

        // Filter out any where searchedUser might be null (deleted users)
        const validHistory = history.filter(item => item.searchedUser);

        res.status(200).json(validHistory);
    } catch (error) {
        console.error("Error fetching user search history:", error);
        res.status(500).json({ message: "Error fetching history" });
    }
};

export const deleteUserSearchHistoryItem = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const { searchedUserId } = req.params;

        await UserSearchHistory.deleteOne({ user: currentUserId, searchedUser: searchedUserId });
        res.status(200).json({ ok: true });
    } catch (error) {
        console.error("Error deleting user search history item:", error);
        res.status(500).json({ message: "Error deleting item" });
    }
};

export const clearUserSearchHistory = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        await UserSearchHistory.deleteMany({ user: currentUserId });
        res.status(200).json({ ok: true });
    } catch (error) {
        console.error("Error clearing user search history:", error);
        res.status(500).json({ message: "Error clearing history" });
    }
};

// ------------------------
// Follow Request Management
// ------------------------

export const getFollowRequests = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const user = await User.findById(currentUserId)
            .populate("followRequests", "username name avatar");

        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

        res.status(200).json({ requests: user.followRequests });
    } catch (error) {
        console.error("Error fetching follow requests:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const acceptFollowRequest = async (req, res) => {
    try {
        const requesterId = req.params.requestId;
        const currentUserId = req.user.id;

        const currentUser = await User.findById(currentUserId);
        const requester = await User.findById(requesterId);

        if (!currentUser || !requester) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        if (!currentUser.followRequests.includes(requesterId)) {
            return res.status(400).json({ message: "Solicitud no encontrada" });
        }

        // Add to followers/following
        if (!currentUser.followers.includes(requesterId)) {
            currentUser.followers.push(requesterId);
        }
        if (!requester.following.includes(currentUserId)) {
            requester.following.push(currentUserId);
        }

        // Remove from requests
        currentUser.followRequests.pull(requesterId);

        await currentUser.save();
        await requester.save();

        res.status(200).json({ message: "Solicitud aceptada correctamente" });
    } catch (error) {
        console.error("Error accepting follow request:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const rejectFollowRequest = async (req, res) => {
    try {
        const requesterId = req.params.requestId;
        const currentUserId = req.user.id;

        const currentUser = await User.findById(currentUserId);

        if (!currentUser) return res.status(404).json({ message: "Usuario no encontrado" });

        currentUser.followRequests.pull(requesterId);
        await currentUser.save();

        res.status(200).json({ message: "Solicitud rechazada" });
    } catch (error) {
        console.error("Error rejecting follow request:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};
// ------------------------
// Get User Stats
// ------------------------
export const getUserStats = async (req, res) => {
    try {
        const { userId } = req.params;

        // Fetch user reading profile
        const user = await User.findById(userId).select("readingProfile");
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

        // Aggregate reviews
        const reviews = await Review.find({ user: userId });
        
        const totalReviews = reviews.length;
        const totalBooks = new Set(reviews.map(r => r.bookId)).size;
        const averageRating = totalReviews > 0 
            ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
            : 0;

        // Rating distribution
        const ratingDistribution = [0, 0, 0, 0, 0]; // 1, 2, 3, 4, 5 stars
        const authorsCount = {};
        
        reviews.forEach(r => {
            if (r.rating >= 1 && r.rating <= 5) {
                ratingDistribution[r.rating - 1]++;
            }
            // Stats for authors
            if (r.authors && Array.isArray(r.authors)) {
                r.authors.forEach(author => {
                    authorsCount[author] = (authorsCount[author] || 0) + 1;
                });
            }
        });

        // Stats for categories and also authors from lists
        const categoriesCount = {};
        const userLists = await BookList.find({ user: userId });
        
        userLists.forEach(list => {
            list.books.forEach(book => {
                if (book.categories && Array.isArray(book.categories)) {
                    book.categories.forEach(cat => {
                        categoriesCount[cat] = (categoriesCount[cat] || 0) + 1;
                    });
                }
                if (book.authors && Array.isArray(book.authors)) {
                    book.authors.forEach(author => {
                        authorsCount[author] = (authorsCount[author] || 0) + 1;
                    });
                }
            });
        });

        // Calculate reading stats (unique books)
        const uniqueBooks = new Map(); // googleBookId -> status priority (2: read, 1: reading, 0: not read)
        
        userLists.forEach(list => {
            list.books.forEach(book => {
                const currentPriority = { "read": 2, "reading": 1, "not read": 0 }[book.readingStatus || "not read"];
                const existingPriority = uniqueBooks.get(book.googleBookId) || -1;
                
                if (currentPriority > existingPriority) {
                    uniqueBooks.set(book.googleBookId, currentPriority);
                }
            });
        });

        const readingStats = {
            read: 0,
            reading: 0,
            wantToRead: 0
        };

        for (const priority of uniqueBooks.values()) {
            if (priority === 2) readingStats.read++;
            else if (priority === 1) readingStats.reading++;
            else readingStats.wantToRead++;
        }

        // Update totalBooks to reflect unique books marked as read (more accurate than just reviewed)
        // Or should totalBooks be ALL unique books?
        // Let's keep totalBooks as ALL unique books in library for consistency with "Books Read" usually meaning "Finished"
        // But "Total Books" usually means Library Size. 
        // Let's redefine totalBooks as "Library Size" (all unique books) and use readingStats.read for "Books Read"
        // effectively replacing the review-based count.
        
        const librarySize = uniqueBooks.size;

        // Find top author
        let topAuthor = "N/A";
        let maxAuthorCount = 0;
        for (const [author, count] of Object.entries(authorsCount)) {
            if (count > maxAuthorCount) {
                maxAuthorCount = count;
                topAuthor = author;
            }
        }

        // Find top category
        let topCategory = "N/A";
        let maxCategoryCount = 0;
        for (const [cat, count] of Object.entries(categoriesCount)) {
            if (count > maxCategoryCount) {
                maxCategoryCount = count;
                topCategory = cat;
            }
        }

        // Challenge Stats
        const challenges = await ReadingChallenge.find({ user: userId });
        const challengeStats = {
            active:0,
            completed: 0
        };
        challenges.forEach(c => {
            if (c.status === 'active') challengeStats.active++;
            if (c.status === 'completed') challengeStats.completed++;
        });

        res.status(200).json({
            totalReviews,
            totalBooks: readingStats.read, // Use explicitly READ books for "Books Read" stat
            librarySize,
            readingStats,
            averageRating: parseFloat(averageRating),
            averageRating: parseFloat(averageRating),
            ratingDistribution,
            topAuthor,
            topCategory,
            readingProfile: user.readingProfile,
            challengeStats
        });

    } catch (error) {
        console.error("Error fetching user stats:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// ------------------------
// Get Friends (Mutual Followers)
// ------------------------
export const getFriends = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ message: "User not found" });

        // Find intersection of following and followers
        const mutualIds = user.following.filter(id => user.followers.includes(id));
        
        const friends = await User.find({ _id: { $in: mutualIds } })
            .select("username name avatar isPrivate");

        res.status(200).json({ friends });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching friends" });
    }
};
