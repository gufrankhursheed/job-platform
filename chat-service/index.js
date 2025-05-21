import app from "./app.js";
import "./src/config/env.js";

import http from "http"

const server = http.createServer(app)

server.listen(process.env.PORT || 5004, () => {
    console.log(`Chat server is running on port ${process.env.PORT}`)
})