import { Notification } from "../models/notification.model.js"

const getNotificationsByUserId = async (req, res) => {
    try {
        const userHeader = req.headers['x-user']

        if (!userHeader) {
            return res.status(400).json({ message: 'User information is missing' })
        }

        const user = JSON.parse(userHeader)

        const userId = user?._id

        if (!userId) {
            return res.status(400).json({ message: "User Id is required" })
        }

        const notifications = await Notification.find({ userId }).sort({ createdAt: -1 })

        return res.status(200).json({ message: "Notifications fetched successfully", notifications })
    } catch (error) {
        console.log("Notifications fetched failed:", error)
        return res.status(400).json({ error: error.message })
    }
}

const markNotificationRead = async (req, res) => {
    try {
        const userHeader = req.headers["x-user"]
        const { notificationId } = req.params

        if (!userHeader) {
            return res.status(401).json({ message: "User info missing" })
        }

        const user = JSON.parse(userHeader)

        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, userId: user._id },
            { read: true },
            { new: true }
        )

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" })
        }

        res.status(200).json({
            message: "Notification marked as read",
            notification
        })
    } catch (error) {
        console.log("Mark read error:", error)
        res.status(500).json({ error: error.message })
    }
}

export {
    getNotificationsByUserId,
    markNotificationRead
}