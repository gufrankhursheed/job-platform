import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, getUserById, login, logout, refreshAccessToken, register, updateUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(register)
router.route("/login").post(login)

//secured routes
router.route("/logout").post(verifyJWT, logout)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/:id").get(getCurrentUser)
router.route("/:id/public").get(getUserById);
router.route("/update-user").put(verifyJWT, updateUser)
router.route("/refreshToken").post(refreshAccessToken)


export default router