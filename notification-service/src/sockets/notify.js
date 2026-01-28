import jwt from "jsonwebtoken";
import cookie from "cookie";

export const notificationSocketHandler = (io) => {
    io.use((socket, next) => {
        try {
            const cookieHeader = socket.handshake.headers.cookie;

            if (!cookieHeader) {
                return next(new Error("No cookies found"));
            }

            const cookies = cookie.parse(cookieHeader);
            const token = cookies.accessToken;

            if (!token) {
                return next(new Error("Access token missing"));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            socket.data = { user: decoded }
            next()
        } catch (error) {
            console.log("Verify JWT error: ", error)
            next(new Error("Invalid or expired token"))
        }
    })

    io.on('connection', (socket) => {
        const userId = socket.data.user._id

        if (!userId) {
            return socket.disconnect()
        }

        socket.join(userId)
        console.log(`User-${userId} connected via socket`)

        socket.on('disconnect', () => {
            console.log(`User-${userId} disconnected`);
        })
    })
}