import express from "express"
import cors from "cors"

const app = express()

app.use(express.json())
app.use(cors()) 

app.get("/", (req, res) => {
    res.send("User-profile server is running")
})

import profileRouter from "./src/routes/profile.route.js"

app.use("/api/profile", profileRouter)

export default app