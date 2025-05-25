import express from "express"
import cors from "cors"

const app = express()

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
    res.send("Notification server is running")
})

import notificationRouter from "./src/routes/notification.route.js"

app.use("/api/notification", notificationRouter)

export default app