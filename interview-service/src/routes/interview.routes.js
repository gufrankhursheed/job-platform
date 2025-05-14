import { Router } from "express";
import { getInterviewsByRecruiter, scheduleInterview } from "../controllers/interview.controller";

const router = Router()

router.route("/").post(scheduleInterview)
router.route("/recruiter/:id").get(getInterviewsByRecruiter)
router.route("/candidate/:id").get(getInterviewsByRecruiter)

export default router