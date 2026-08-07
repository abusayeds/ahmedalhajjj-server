"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionRoutes = void 0;
const express_1 = require("express");
const subscription_controller_1 = require("./subscription.controller");
const auth_1 = require("../../../middlewares/auth");
const router = (0, express_1.Router)();
// Public routes
router.get("/", subscription_controller_1.getSubscriptions);
router.get("/trial-config", subscription_controller_1.getTrialConfigHandler);
router.get("/:id", subscription_controller_1.getSubscriptionDetail);
// Admin / Management routes
router.post("/create", subscription_controller_1.createSubscription);
router.patch("/trial-config", subscription_controller_1.updateTrialConfigHandler);
router.post("/trial-config", subscription_controller_1.updateTrialConfigHandler);
router.patch("/:id", subscription_controller_1.updateSubscription);
router.delete("/:id", subscription_controller_1.deleteSubscription);
// Protected user routes
router.get("/user/purchases", (0, auth_1.authMiddleware)(), subscription_controller_1.getUserSubscriptions);
router.get("/user/current", (0, auth_1.authMiddleware)(), subscription_controller_1.getCurrentSubscription);
router.get("/user/trial-status", (0, auth_1.authMiddleware)(), subscription_controller_1.getTrialStatus);
router.post("/purchase/initiate", (0, auth_1.authMiddleware)(), subscription_controller_1.initiatePurchase);
exports.subscriptionRoutes = router;
