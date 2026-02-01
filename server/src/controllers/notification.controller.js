import Notification from "../models/notification.model.js";

// Helper to clean notifications for the client
const cleanNotification = (notification) => {
    return {
        _id: notification._id,
        recipient: notification.recipient,
        sender: {
            _id: notification.sender._id,
            username: notification.sender.username,
            avatar: notification.sender.avatar
        },
        type: notification.type,
        data: notification.data,
        isRead: notification.isRead,
        createdAt: notification.createdAt
    };
};

export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .populate("sender", "username avatar")
            .sort({ createdAt: -1 })
            .limit(50); // Limit to last 50 notifications for now

        res.status(200).json({ 
            notifications: notifications.map(cleanNotification) 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching notifications" });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findOneAndUpdate(
            { _id: id, recipient: req.user._id },
            { isRead: true },
            { new: true }
        ).populate("sender", "username avatar");

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.status(200).json({ notification: cleanNotification(notification) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating notification" });
    }
};

export const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, isRead: false },
            { isRead: true }
        );

        res.status(200).json({ message: "All notifications marked as read" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating notifications" });
    }
};
