import { Router } from "express";
import { createProfile } from "../controllers/profile.controller";

const router = Router()

router.route("/").post(createProfile)

export default router