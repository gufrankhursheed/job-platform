import "./src/config/env.js"

import http from "http"
import app from "./app.js"
import connectDb from "./src/db/index.js"
import { Server } from "socket.io"
import { notificationSocketHandler } from "./src/sockets/notify.js"

const server = http.createServer()
const io = new Server(server, {
    cors:  { origin: '*' }
})

connectDb()
.then(() => {
    server.listen(process.env.PORT || 5006, () => {
        console.log(`Notification service is running on port ${process.env.PORT}`)
    })
})
.catch((error) => {
    console.log("Error: ", error)
})

notificationSocketHandler(io)