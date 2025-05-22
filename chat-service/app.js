import express from "express";
import cors from "cors";

const app = express()

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
    res.send("Chat server is running")
})

import messageRouter from "./src/routes/message.route.js"

app.use("/api/chat", messageRouter)

export default app 