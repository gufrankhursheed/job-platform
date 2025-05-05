import { Router } from "express";
import { createJob } from "../controllers/job.controller";

const router = Router()

router.route("/").post(createJob)

export default router