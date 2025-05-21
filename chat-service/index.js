import app from "./app.js";
import "./src/config/env.js";

import http from "http"
import connectDb from "./src/db/index.js";

const server = http.createServer(app)

connectDb()
.then(() => {
    server.listen(process.env.PORT || 5004, () => {
        console.log(`Chat server is running on port ${process.env.PORT}`)
    })
})
.catch((error) => {
    console.log("Error: ", error)
})