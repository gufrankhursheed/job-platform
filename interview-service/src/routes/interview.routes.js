import { Router } from "express";
import { cancelInterview, getInterviewsByRecruiter, scheduleInterview, updateInterview } from "../controllers/interview.controller";

const router = Router()

router.route("/").post(scheduleInterview)
router.route("/recruiter/:id").get(getInterviewsByRecruiter)
router.route("/candidate/:id").get(getInterviewsByRecruiter)
router.route("/:id").put(updateInterview)
router.route("/:id").delete(cancelInterview)

export default router