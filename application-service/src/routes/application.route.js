import { Router } from "express";
import { applyJob, deleteApplicatoin, getCandidateApplication, getJobApplication, updateApplicatoin } from "../controllers/application.controller";

const router = Router()

router.route("/").post(applyJob)
router.route("/candidate/:candidateId").get(getCandidateApplication)
router.route("/job/:jobId").get(getJobApplication)
router.route("/:id").put(updateApplicatoin)
router.route(":id").delete(deleteApplicatoin)

export default router