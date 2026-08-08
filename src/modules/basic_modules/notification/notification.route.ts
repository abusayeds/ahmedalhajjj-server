import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth";
import { role } from "../../../utils/role";
import {
  deleteNotificationHandler,
  getAudienceStatsHandler,
  getNotificationsAdmin,
  getNotificationsApp,
  scheduleNotificationHandler,
  sendNotificationHandler,
  updateNotificationHandler,
} from "./notification.controller";

const router = Router();

router.get("/app", authMiddleware(role.user), getNotificationsApp);

router.get("/audience-stats", authMiddleware(role.admin), getAudienceStatsHandler);
router.get("/", authMiddleware(role.admin), getNotificationsAdmin);
router.post("/send", authMiddleware(role.admin), sendNotificationHandler);
router.post("/schedule", authMiddleware(role.admin), scheduleNotificationHandler);
router.patch("/:id", authMiddleware(role.admin), updateNotificationHandler);
router.delete("/:id", authMiddleware(role.admin), deleteNotificationHandler);

export const notificationRoutes = router;
