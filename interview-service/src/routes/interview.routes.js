import { Router } from "express";
import { cancelInterview, getInterviewsByCandidate, getInterviewsByRecruiter, getUpcomingInterviewsByRecruiter, getUpcomingInterviewsCountByRecruiter, scheduleInterview, updateInterview, updateInterviewStatus } from "../controllers/interview.controller.js";

const router = Router()

router.route("/").post(scheduleInterview)
router.route("/recruiter/upcoming").get(getUpcomingInterviewsByRecruiter)
router.route("/recruiter/upcoming/count").get(getUpcomingInterviewsCountByRecruiter)
router.route("/recruiter/:id").get(getInterviewsByRecruiter)
router.route("/candidate/:id").get(getInterviewsByCandidate)
router.route("/:id").put(updateInterview)
router.route("/:id/status").put(updateInterviewStatus)
router.route("/:id").delete(cancelInterview)

export default router