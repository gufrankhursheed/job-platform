import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"

const app = express()

app.use(express.json())
app.use(cors())
app.use(cookieParser())

app.get("/", (req, res) => {
    res.send("Api-gateway is running")
})

import authRouter from "./src/routes/user.route.js"
import googleRouter from "./src/routes/google.route.js"

app.use("/api/user", authRouter)
app.use("/api/auth", googleRouter)

export default app