import express from "express";
import { UserRoutes } from "../modules/basic_modules/user/user.route";
import { managementRoutes } from "../modules/basic_modules/management/management.route";
import { subscriptionRoutes } from "../modules/basic_modules/subscription/subscription.route";
import { couponRoutes } from "../modules/basic_modules/coupon/coupon.route";
import { paymentRoutes } from "../modules/payment/payment.route";
import { signalRoutes } from "../modules/basic_modules/signal/signal.route";
import { postRoutes } from "../modules/basic_modules/post/post.route";
import { notificationRoutes } from "../modules/basic_modules/notification/notification.route";
import { dashboardRoutes } from "../modules/basic_modules/dashboard/dashboard.route";
import uploadRouter from "../fileUpload/route";

const router = express.Router();

router.use("/api/v1/user", UserRoutes);
router.use("/api/v1/management", managementRoutes);
router.use("/api/v1/subscription", subscriptionRoutes);
router.use("/api/v1/coupon", couponRoutes);
router.use("/api/v1/signal", signalRoutes);
router.use("/api/v1/post", postRoutes);
router.use("/api/v1/notification", notificationRoutes);
router.use("/api/v1/dashboard", dashboardRoutes);
router.use("/api/v1/upload", uploadRouter);
router.use("/stripe", paymentRoutes);

export default router;
