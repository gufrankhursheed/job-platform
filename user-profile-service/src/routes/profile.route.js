import { Router } from "express";
import { createProfile, deleteProfile, getUserProfile, updateProfile, updateResume } from "../controllers/profile.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.route("/").post(upload.single('resume'), createProfile)
router.route("/:userId").get(getUserProfile)
router.route("/update-profile/:userId").put(updateProfile)
router.route("/update-resume/:userId").put(upload.single('resume'), updateResume)
router.route("/:userId").delete(deleteProfile)

export default router