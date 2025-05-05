import { Router } from "express";
import { createJob, getAllJobs, getJobById } from "../controllers/job.controller";

const router = Router()

router.route("/").post(createJob)
router.route("/").get(getAllJobs)
router.route("/:id").get(getJobById)

export default router