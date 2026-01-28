import { Router } from "express";
import { createJob, deleteJob, getAllJobs, getJobById, getJobsByEmployer, updateJob } from "../controllers/job.controller.js";

const router = Router()

router.route("/").post(createJob)
router.route("/").get(getAllJobs)
router.route("/:id").get(getJobById)
router.route("/employer/:employerId").get(getJobsByEmployer)
router.route("/:id").put(updateJob)
router.route("/:id").delete(deleteJob)

export default router