import { Notification } from "../models/notification.model.js"

const getNotificationsByUserId = async(req, res) => {
    try {
        const userHeader = req.headers['x-user']        

        if(!userHeader) {
            return res.status(400).json({ message: 'User information is missing' })
        }

        const user = JSON.parse(userHeader)

        const id = user?._id

        if(!id) {
            return res.status(400).json({message: "User Id is required"})
        }

        const { userId } = req.params

        if(!userId) {
            return res.status(400).json({ message: 'Missing userId' })
        }

        const notifications = await Notification.find({ userId }).sort({ createdAt: -1 })

        return res.status(200).json({ message: "Notifications fetched successfully", notifications })
    } catch (error) {
        console.log("Notifications fetched failed:", error)
        return res.status(400).json({error: error.message})
    }
}

const markNotificationRead = async(req, res) => {
    try {
        const { notificationId } = req.params

        if(!notificationId) {
            return res.status(400).json({ message: 'Missing notificationId' })
        }

        const notification = await Notification.findByIdAndUpdate(notificationId, { read: true });
        res.status(200).json({ message: 'Notification marked as read', notification })
    } catch (error) {
        console.log("Notifications mark read failed:", error)
        return res.status(400).json({error: error.message})
    }
}

export {
    getNotificationsByUserId,
    markNotificationRead
}