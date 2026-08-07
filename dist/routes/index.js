"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_route_1 = require("../modules/basic_modules/user/user.route");
const management_route_1 = require("../modules/basic_modules/management/management.route");
const subscription_route_1 = require("../modules/basic_modules/subscription/subscription.route");
const coupon_route_1 = require("../modules/basic_modules/coupon/coupon.route");
const payment_route_1 = require("../modules/payment/payment.route");
const router = express_1.default.Router();
router.use("/api/v1/user", user_route_1.UserRoutes);
router.use("/api/v1/management", management_route_1.managementRoutes);
router.use("/api/v1/subscription", subscription_route_1.subscriptionRoutes);
router.use("/api/v1/coupon", coupon_route_1.couponRoutes);
router.use("/stripe", payment_route_1.paymentRoutes);
exports.default = router;
