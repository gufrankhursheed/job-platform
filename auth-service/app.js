import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"

const app = express()

app.use(express.json())
app.use(cors())
app.use(cookieParser())

app.get("/", (req, res) => {
    res.send("Auth server is running")
})

import authRouter from "./src/routes/user.route.js"

app.use("/api/user", authRouter)

export default app