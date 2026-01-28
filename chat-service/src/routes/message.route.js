import { Router } from "express";
import { getMessages, getUnreadCount, updateMessage } from "../controllers/message.controller.js";

const router = Router()

router.route("/:id").get(getMessages)
router.route("/seen/:id").put(updateMessage)
router.get("/unreadCount", getUnreadCount);


export default router