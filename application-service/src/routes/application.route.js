import { Router } from "express";
import { applyJob, deleteApplication, getApplicationByIdWithCandidate, getApplicationByIdWithRecruiter, getCandidateApplication, getJobApplication, updateApplication } from "../controllers/application.controller.js";

const router = Router()

router.route("/").post(applyJob)
router.route("/candidate/:candidateId").get(getCandidateApplication)
router.route("/:id/recruiter").get(getApplicationByIdWithRecruiter)
router.route("/job/:jobId").get(getJobApplication)
router.route("/:id/candidate").get(getApplicationByIdWithCandidate)
router.route("/:id").put(updateApplication)
router.route("/:id").delete(deleteApplication)

export default router