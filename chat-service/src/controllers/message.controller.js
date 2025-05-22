import { Message } from "../models/message.model"


const getMessages = async(req, res) => {
    try {
        const userHeader = req.headers['x-user']        

        if(!userHeader) {
            return res.status(400).json({ message: 'User information is missing' })
        }

        const user = JSON.parse(userHeader)

        const userId = user?._id

        if(!userId) {
            return res.status(400).json({message: "User Id is required"})
        }

        const chatUserId = req.params.id

        if(!chatUserId) {
            return res.status(400).json({message: "Chat User Id Id is required"})
        }

        const messages = await Message.find({
            $or: [
                { senderId: userId, receiverId: chatUserId },
                { senderId: chatUserId, receiverId: userId }
            ]
        }).sort({ createdAt: -1})

        if(!messages) {
            return res.status(400).json({message: "Messages not found"})
        }

        return res.status(200).json({ message: "Messages retrieved successfully", messages})
    } catch (error) {
        console.log("Message retrieve failed:", error)
        return res.status(400).json({error: error.message})
    }
}

export {
    getMessages
}