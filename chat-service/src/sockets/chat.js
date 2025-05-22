import jwt from "jsonwebtoken"
import { Message } from "../models/message.model"

export const chatSocketHandler = (io) => {
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth.token

            if(!token) {
                return res.status(400).json({ message: "Token is missing"})
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            socket.data = { user: decoded }
            next()
        } catch (error) {
            console.log("Verify JWT error: ", error)
            return res.status(400).json({error: error})
        }
    })

    io.on('connection', (socket) => {
        const userId = socket.data.user._id
        
        if(!userId) {
            return socket.disconnect()
        }

        socket.join(userId)
        console.log(`User-${userId} connected via socket`)

        socket.on('sendMessage', async({receiverId, message}) => {
            try {
                if(!receiverId || !message) {
                    return socket.emit('error', 'Invalid message payload')
                }
    
                const newMsg = await Message.create({
                    senderId: userId,
                    receiverId,
                    message,
                })
    
                io.to(userId).emit('newMessage', newMsg)
                io.to(receiverId).emit('newMessage', newMsg)
            } catch (error) {
                console.log(error);
                socket.emit('error', 'Failed to send message')
            }
        })

        socket.on('disconnect', () => {
            console.log(`User-${userId} disconnected`);
        })
    })
}