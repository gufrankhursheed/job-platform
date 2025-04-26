import { Router } from "express";
import { createProfile, getUserProfile, updateProfile } from "../controllers/profile.controller";

const router = Router()

router.route("/").post(createProfile)
router.route("/:userId").get(getUserProfile)
router.route("/:userId").put(updateProfile)

export default router