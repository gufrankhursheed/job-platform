import express from "express"
import cors from "cors"

const app = express()

app.use(express.json())
app.use(cors())

app.get("/",(req, res) => {
    res.send("Interview service is running")
})

import interviewRouter from "./src/routes/interview.routes"

app.use("/api/interview", interviewRouter)

export default app