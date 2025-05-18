import express from "express"
import cors from "cors"

const app = express()

app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
    res.send("Application server is running")
})

import applicationRouter from "./src/routes/application.route.js"

app.use("/api/application", applicationRouter)

export default app