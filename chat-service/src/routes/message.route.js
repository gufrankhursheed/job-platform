import { Router } from "express";
import { getMessages, updateMessage } from "../controllers/message.controller.js";

const router = Router()

router.route("/:id").get(getMessages)
router.route("/seen/:id").put(updateMessage)

export default router