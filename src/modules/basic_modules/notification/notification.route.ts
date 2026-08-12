import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth";
import { role } from "../../../utils/role";
import {
  deleteNotificationHandler,
  getAudienceStatsHandler,
  getNotificationsAdmin,
  getNotificationsApp,
  getUnreadNotificationCountHandler,
  markAllNotificationsReadHandler,
  markNotificationReadHandler,
  scheduleNotificationHandler,
  sendNotificationHandler,
  updateNotificationHandler,
} from "./notification.controller";

const router = Router();

router.get("/app/unread-count", authMiddleware(role.user), getUnreadNotificationCountHandler);
router.post("/app/read-all", authMiddleware(role.user), markAllNotificationsReadHandler);
router.get("/app", authMiddleware(role.user), getNotificationsApp);
router.post("/app/:notificationId/read", authMiddleware(role.user), markNotificationReadHandler);

router.get("/audience-stats", authMiddleware(role.admin), getAudienceStatsHandler);
router.get("/", authMiddleware(role.admin), getNotificationsAdmin);
router.post("/send", authMiddleware(role.admin), sendNotificationHandler);
router.post("/schedule", authMiddleware(role.admin), scheduleNotificationHandler);
router.patch("/:id", authMiddleware(role.admin), updateNotificationHandler);
router.delete("/:id", authMiddleware(role.admin), deleteNotificationHandler);

export const notificationRoutes = router;
