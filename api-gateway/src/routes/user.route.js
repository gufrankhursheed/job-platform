import { Router } from "express";
import { changeCurrentPassword, login, logout, refreshAccessToken, register } from "../controllers/user.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router()

router.route("/register").post(register)
router.route("/login").post(login)

//secured routes
router.route("/logout").post(verifyJWT, logout)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/refreshToken").post(refreshAccessToken)

export default router