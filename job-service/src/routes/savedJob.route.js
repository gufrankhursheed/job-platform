import { Router } from "express";
import { getSavedJobs, saveJob, unsaveJob } from "../controllers/savedJob.controller.js";

const router = Router();

router.route("/").post(saveJob);
router.route("/:jobId").delete(unsaveJob);
router.route("/").get(getSavedJobs);

export default router;