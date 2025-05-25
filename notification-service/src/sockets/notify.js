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

        if(!userId) {
            return socket.disconnect()
        }

        socket.join(userId)
        console.log(`User-${userId} connected via socket`)
        
        socket.on('disconnect', () => {
            console.log(`User-${userId} disconnected`);
        })
    })
}