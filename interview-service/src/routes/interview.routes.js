import { Router } from "express";
import { scheduleInterview } from "../controllers/interview.controller";

const router = Router()

router.route("/").post(scheduleInterview)

export default router