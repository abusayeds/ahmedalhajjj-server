import { Router, Request, Response } from "express";
import { handleStripeWebhook } from "./stripe.service";

const router = Router();

// Webhook route - receives raw body from Express middleware
router.post("/webhook", handleStripeWebhook);

export const paymentRoutes = router;
