import { Router } from "express";
import { protect } from "../middleware/protect.js";
import { getNotifications, markAsRead, markAllAsRead } from "../controllers/notification.controller.js";

const router = Router();

router.use(protect);

router.get("/", getNotifications);
router.put("/:id/read", markAsRead);
router.put("/read-all", markAllAsRead);

export default router;
