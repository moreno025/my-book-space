import express from "express";
import {
    createBookClub,
    getUserClubs,
    discoverClubs,
    getClubById,
    updateClub,
    deleteClub,
    joinClub,
    leaveClub,
    approveJoinRequest,
    removeMember,
    inviteUser,
    setCurrentBook,
    shareBook,
} from "../controllers/bookClub.controller.js";
import {
    getClubMessages,
    sendMessage,
    togglePinMessage,
    deleteMessage,
} from "../controllers/clubMessage.controller.js";
import { uploadClubAvatar } from "../middleware/multer.js";
import { protect as authenticateToken } from "../middleware/protect.js";

const router = express.Router();

// Club management
router.post("/", authenticateToken, createBookClub);
router.get("/", authenticateToken, getUserClubs);
router.get("/discover", authenticateToken, discoverClubs);
router.get("/:clubId", authenticateToken, getClubById);
router.put("/:clubId", authenticateToken, uploadClubAvatar, updateClub);
router.delete("/:clubId", authenticateToken, deleteClub);

// Membership
router.post("/:clubId/join", authenticateToken, joinClub);
router.post("/:clubId/leave", authenticateToken, leaveClub);
router.post("/:clubId/invite", authenticateToken, inviteUser);
router.post("/:clubId/approve/:userId", authenticateToken, approveJoinRequest);
router.delete("/:clubId/members/:userId", authenticateToken, removeMember);

// Books
router.put("/:clubId/current-book", authenticateToken, setCurrentBook);
router.post("/:clubId/share-book", authenticateToken, shareBook);

// Messages
router.get("/:clubId/messages", authenticateToken, getClubMessages);
router.post("/:clubId/message", authenticateToken, sendMessage);
router.put("/:clubId/message/:messageId/pin", authenticateToken, togglePinMessage);
router.delete("/:clubId/message/:messageId", authenticateToken, deleteMessage);

export default router;
