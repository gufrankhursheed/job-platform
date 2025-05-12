import { Router } from "express";
import { applyJob, deleteApplication, getCandidateApplication, getJobApplication, updateApplication } from "../controllers/application.controller";

const router = Router()

router.route("/").post(applyJob)
router.route("/candidate/:candidateId").get(getCandidateApplication)
router.route("/job/:jobId").get(getJobApplication)
router.route("/:id").put(updateApplication)
router.route(":id").delete(deleteApplication)

export default router