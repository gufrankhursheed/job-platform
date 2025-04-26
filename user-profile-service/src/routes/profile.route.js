import { Router } from "express";
import { createProfile, getUserProfile } from "../controllers/profile.controller";

const router = Router()

router.route("/").post(createProfile)
router.route("/:userId").get(getUserProfile)

export default router