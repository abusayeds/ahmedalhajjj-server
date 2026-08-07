"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRoutes = void 0;
const express_1 = require("express");
const stripe_service_1 = require("./stripe.service");
const router = (0, express_1.Router)();
// Webhook route - receives raw body from Express middleware
router.post("/webhook", stripe_service_1.handleStripeWebhook);
exports.paymentRoutes = router;
