import { Router } from "express";
import { createJob, getAllJobs, getJobById, updateJob } from "../controllers/job.controller";

const router = Router()

router.route("/").post(createJob)
router.route("/").get(getAllJobs)
router.route("/:id").get(getJobById)
router.route("/:id").put(updateJob)

export default router