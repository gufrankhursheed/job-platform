import { Router } from "express";
import { getNotificationsByUserId, markNotificationRead } from "../controllers/notification.controller";

const router = Router()

router.route("/:userId").get(getNotificationsByUserId)
router.route("/:notificationId/read").put(markNotificationRead)

export default router