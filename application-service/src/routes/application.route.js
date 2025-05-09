import { Router } from "express";
import { applyJob, getCandidateApplication, getJobApplication, updateApplicatoin } from "../controllers/application.controller";

const router = Router()

router.route("/").post(applyJob)
router.route("/candidate/:candidateId").get(getCandidateApplication)
router.route("/job/:jobId").get(getJobApplication)
router.route("/:id").put(updateApplicatoin)

export default router