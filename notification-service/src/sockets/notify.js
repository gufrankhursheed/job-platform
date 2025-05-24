import jwt from "jsonwebtoken"

export const notificationSocketHandler = (io) => {
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth.token
            
            if(!token) {
                return res.status(400).json({ message: "Token is missing" })
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

        if(userId) {
            return socket.disconnect()
        }

        socket.join(userId)
        console.log(`User-${userId} connected via socket`)

        socket.on('notify', async({ userId, message, type, metadata }) => {
            try {
                if (!userId || !message) {
                    return socket.emit('error', 'Missing userId or message')
                }

                const notification = await Notification.create({ userId, message, type, metadata });
                io.to(userId).emit('newNotification', notification)
            } catch (error) {
                console.error('Notification error:', error)
                socket.emit('error', 'Failed to create notification')
            }
        })

        socket.on('disconnect', () => {
            console.log(`User-${userId} disconnected`);
        })
    })
}