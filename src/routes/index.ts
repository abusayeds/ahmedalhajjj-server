import express from "express";
import { UserRoutes } from "../modules/basic_modules/user/user.route";
import { managementRoutes } from "../modules/basic_modules/management/management.route";
import { subscriptionRoutes } from "../modules/basic_modules/subscription/subscription.route";
import { couponRoutes } from "../modules/basic_modules/coupon/coupon.route";
import { paymentRoutes } from "../modules/payment/payment.route";

const router = express.Router();

router.use("/api/v1/user", UserRoutes);
router.use("/api/v1/management", managementRoutes);
router.use("/api/v1/subscription", subscriptionRoutes);
router.use("/api/v1/coupon", couponRoutes);
router.use("/stripe", paymentRoutes);

export default router;
