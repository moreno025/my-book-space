import User from "../models/user.model.js";
import BookList from "../models/bookList.model.js";
import Review from "../models/review.model.js";
import UserSearchHistory from "../models/userSearchHistory.model.js";


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

        currentUser.following.push(userToFollowId);
        userToFollow.followers.push(currentUserId);
        await currentUser.save();
        await userToFollow.save();

        res.status(200).json({ message: "Usuario seguido correctamente" });

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
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const userToUnfollow = await User.findById(userToUnfollowId);
        const currentUser = await User.findById(currentUserId);

        if(!userToUnfollow || !currentUser) {
            return res.status(404).json({ message: "Usuario no encontrado" });
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
        console.log(`[DEBUG] getUser called with username: ${username}`); // DEBUG LOG
        const currentUserId = req.user?.id;

        const user = await User.findOne({ username })
            .select("username name lastName bio avatar followers following isPrivate");

        if (!user) {
            console.log(`[DEBUG] getUser: User not found for username: ${username}`); // DEBUG LOG
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        const isFollowing = currentUserId ? user.followers.includes(currentUserId) : false;
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
            canViewFullProfile
        });

    }catch(error){
        console.error("Error obteniendo usuario:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};


// ------------------------
// Get User Lists
// ------------------------
export const getUserLists = async (req, res) => {
    try {
        const { username } = req.params;

        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

        // Comprobar privacidad
        const canView = !user.isPrivate ||
        (req.user && (user.followers.includes(req.user._id) || user._id.equals(req.user._id)));

        if (!canView) return res.status(403).json({ message: "Perfil privado" });

        const lists = await BookList.find({ user: user._id })
        .sort({ savedBy: -1, createdAt: -1 });

        res.status(200).json({ lists });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obteniendo listas del usuario" });
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