import { Router } from "express";
import { applyJob, getCandidateApplication, getJobApplication } from "../controllers/application.controller";

const router = Router()

router.route("/").post(applyJob)
router.route("/candidate/:candidateId").get(getCandidateApplication)
router.route("/job/:jobId").get(getJobApplication)

export default router