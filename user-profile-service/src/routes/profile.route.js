import { Router } from "express";
import { createProfile, getUserProfile, updateProfile, updateResume } from "../controllers/profile.controller";
import { upload } from "../middlewares/multer.middleware";

const router = Router()

router.route("/").post(upload.single('resume'), createProfile)
router.route("/:userId").get(getUserProfile)
router.route("/update-profile/:userId").put(updateProfile)
router.route("/update-resume/:userId").put(upload.single('resume'), updateResume)

export default router