import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createProxyMiddleware } from "http-proxy-middleware";
import { verifyJWT } from "./src/middlewares/auth.middleware.js";

const app = express()

app.use(cors())
app.use(cookieParser())

app.get("/", (req, res) => {
    res.send("Api-gateway is running")
})

app.use("/api/user/profile", verifyJWT, 
    (req, res, next) => {
        if(req.user) {
            req.headers['x-user'] = JSON.stringify(req.user)
        }
        next()
    },
    createProxyMiddleware({
        target: "http://localhost:5001",
        changeOrigin: true,
        pathRewrite: (path, req) => {
            if (path === "/") return "/api/profile";
            return "/api/profile" + path;
        },
        onProxyReq: (proxyReq, req, res) => {
            console.log("Proxy request made to:", proxyReq.path);
        },
    })
)

app.use("/api/job", verifyJWT, 
    (req, res, next) => {
        if(req.user) {
            req.headers['x-user'] = JSON.stringify(req.user)
        }
        next()
    },
    createProxyMiddleware({
        target: "http://localhost:5002",
        changeOrigin: true,
        pathRewrite: (path, req) => {
            if (path === "/") return "/api/job";
            return "/api/job" + path;
        },
        onProxyReq: (proxyReq, req, res) => {
            console.log("Proxy request made to:", proxyReq.path);
        },
    })
)

app.use(express.json())

import authRouter from "./src/routes/user.route.js"
import googleRouter from "./src/routes/google.route.js"

app.use("/api/user", authRouter)
app.use("/api/auth", googleRouter)
  
export default app