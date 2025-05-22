import app from "./app.js";
import "./src/config/env.js";

import http from "http"
import connectDb from "./src/db/index.js";
import { Server } from "socket.io";
import { chatSocketHandler } from "./src/sockets/chat.js";

const server = http.createServer(app)
const io = new Server(server, {
    cors: { origin: '*' }
})

connectDb()
.then(() => {
    server.listen(process.env.PORT || 5004, () => {
        console.log(`Chat server is running on port ${process.env.PORT}`)
    })
})
.catch((error) => {
    console.log("Error: ", error)
})

chatSocketHandler(io)