import { Router } from "express";
import { login, logout, register } from "../controllers/user.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router()

router.route("/register").post(register)
router.route("/login").post(login)

//secured routes
router.route("/logout").post(verifyJWT, logout)

export default router