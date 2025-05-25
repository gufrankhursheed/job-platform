import "./src/config/env.js"

import http from "http"
import app from "./app.js"
import connectDb from "./src/db/index.js"
import { Server } from "socket.io"
import { notificationSocketHandler } from "./src/sockets/notify.js"
import { setIO } from "./src/sockets/socketInstance.js"
import { consumeNotifications } from "./src/queues/notificationConsumer.js"

const server = http.createServer(app)
const io = new Server(server, {
    cors:  { origin: '*' }
})

setIO(io)

notificationSocketHandler(io)

connectDb()
.then(() => {
    server.listen(process.env.PORT || 5006, () => {
        console.log(`Notification service is running on port ${process.env.PORT}`)
    })

    consumeNotifications()
})
.catch((error) => {
    console.log("Error: ", error)
})