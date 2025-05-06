import { Router } from "express";
import { applyJob } from "../controllers/application.controller";

const router = Router()

router.route("/").post(applyJob)

export default router