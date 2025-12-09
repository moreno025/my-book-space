import User from "../models/user.model.js";
import BookList from "../models/bookList.model.js";


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
// Get User
// ------------------------
export const getUser = async (req, res) => {
    try{
        const { username } = req.params;

        const user = await User.findOne({ username })
            .select("username name lastName bio avatar followers following");

        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

        res.status(200).json({
            id: user._id,
            username: user.username,
            name: user.name,
            lastName: user.lastName,
            bio: user.bio,
            avatar: user.avatar,
            followersCount: user.followers.length,
            followingCount: user.following.length
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