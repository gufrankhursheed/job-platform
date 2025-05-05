import express from "express"
import cors from "cors"

const app = express()

app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
    res.send("Job server is running")
})

import jobRouter from "./src/routes/job.route.js"

app.use("/api/job", jobRouter)

export default app 