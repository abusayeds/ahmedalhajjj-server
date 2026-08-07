import { Router } from "express";
import {
  getSubscriptions,
  getSubscriptionDetail,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  getTrialConfigHandler,
  updateTrialConfigHandler,
  getUserSubscriptions,
  getCurrentSubscription,
  getTrialStatus,
  initiatePurchase,
} from "./subscription.controller";
import { authMiddleware } from "../../../middlewares/auth";

const router = Router();

// Public routes
router.get("/", getSubscriptions);
router.get("/trial-config", getTrialConfigHandler);
router.get("/:id", getSubscriptionDetail);

// Admin / Management routes
router.post("/create", createSubscription);
router.patch("/trial-config", updateTrialConfigHandler);
router.post("/trial-config", updateTrialConfigHandler);
router.patch("/:id", updateSubscription);
router.delete("/:id", deleteSubscription);

// Protected user routes
router.get("/user/purchases", authMiddleware(), getUserSubscriptions);
router.get("/user/current", authMiddleware(), getCurrentSubscription);
router.get("/user/trial-status", authMiddleware(), getTrialStatus);
router.post("/purchase/initiate", authMiddleware(), initiatePurchase);

export const subscriptionRoutes = router;
