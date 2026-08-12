"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCheckoutSession = exports.handleStripeWebhook = void 0;
const stripe_1 = __importDefault(require("stripe"));
const config_1 = require("../../config");
const user_model_1 = require("../../modules/basic_modules/user/user.model");
const subscription_model_1 = require("../../modules/basic_modules/subscription/subscription.model");
const coupon_model_1 = require("../../modules/basic_modules/coupon/coupon.model");
const planSnapshot_1 = require("../../utils/planSnapshot");
const resolveSubscriptionType = (name) => {
    const value = (name || "").toLowerCase();
    if (value.includes("forex"))
        return "Forex";
    if (value.includes("crypto"))
        return "Crypto";
    return "VIP";
};
const activateUserSubscription = (userId_1, subscriptionName_1, endDate_1, purchaseId_1, ...args_1) => __awaiter(void 0, [userId_1, subscriptionName_1, endDate_1, purchaseId_1, ...args_1], void 0, function* (userId, subscriptionName, endDate, purchaseId, status = "active") {
    yield user_model_1.UserModel.findByIdAndUpdate(userId, {
        subscriptionType: resolveSubscriptionType(subscriptionName),
        subscriptionStatus: status,
        subscriptionEndDate: endDate,
        currentSubscription: purchaseId || null,
    });
});
const stripe = new stripe_1.default(config_1.STRIPE_SECRET_KEY, {
    apiVersion: "2024-04-10",
});
const handleStripeWebhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sig = req.headers["stripe-signature"];
    let event;
    try {
        if (config_1.STRIPE_WEBHOOK_SECRET && sig) {
            event = stripe.webhooks.constructEvent(req.rawBody || req.body, sig, config_1.STRIPE_WEBHOOK_SECRET);
        }
        else {
            event = req.body;
        }
    }
    catch (err) {
        console.error(`⚠️  Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    // Handle the event
    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object;
            console.log("Checkout session completed:", session.id);
            if (session.metadata) {
                const { userId, subscriptionId, couponCode, subscriptionName, purchaseId } = session.metadata;
                let purchase = purchaseId
                    ? yield subscription_model_1.PurchaseModel.findById(purchaseId)
                    : yield subscription_model_1.PurchaseModel.findOne({
                        userId,
                        subscriptionId,
                        paymentStatus: "pending",
                    }).sort({ createdAt: -1 });
                const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                const paidAmount = (session.amount_total || 0) / 100;
                if (!purchase) {
                    const subscription = subscriptionId
                        ? yield subscription_model_1.SubscriptionModel.findById(subscriptionId)
                        : null;
                    purchase = new subscription_model_1.PurchaseModel({
                        userId,
                        subscriptionId,
                        subscriptionName: subscriptionName || "VIP",
                        planSnapshot: subscription
                            ? (0, planSnapshot_1.buildPlanSnapshot)(subscription, "monthly")
                            : undefined,
                        stripeCustomerId: session.customer,
                        stripeSubscriptionId: session.subscription,
                        startDate: new Date(),
                        endDate,
                        paymentStatus: "completed",
                        amount: paidAmount,
                        isActive: true,
                        billingCycle: "monthly",
                    });
                }
                else {
                    if (!purchase.planSnapshot && purchase.subscriptionId) {
                        const subscription = yield subscription_model_1.SubscriptionModel.findById(purchase.subscriptionId);
                        if (subscription) {
                            purchase.planSnapshot = (0, planSnapshot_1.buildPlanSnapshot)(subscription, purchase.billingCycle || "monthly");
                        }
                    }
                    purchase.stripeCustomerId = session.customer;
                    purchase.stripeSubscriptionId = session.subscription;
                    purchase.paymentStatus = "completed";
                    purchase.isActive = true;
                    purchase.endDate = endDate;
                    if (paidAmount > 0) {
                        purchase.amount = paidAmount;
                    }
                }
                yield purchase.save();
                if (userId) {
                    yield subscription_model_1.PurchaseModel.updateMany({
                        userId,
                        _id: { $ne: purchase._id },
                        isActive: true,
                    }, { $set: { isActive: false } });
                    yield activateUserSubscription(userId, purchase.subscriptionName, purchase.endDate, String(purchase._id), "active");
                }
                if (couponCode) {
                    const coupon = yield coupon_model_1.CouponModel.findOne({ code: couponCode.toUpperCase() });
                    if (coupon) {
                        coupon.used = (coupon.used || 0) + 1;
                        if (coupon.used >= coupon.limit) {
                            coupon.status = "Exhausted";
                        }
                        yield coupon.save();
                    }
                }
            }
            break;
        }
        case "customer.subscription.updated": {
            const subscription = event.data.object;
            console.log("Subscription updated:", subscription.id);
            const purchase = yield subscription_model_1.PurchaseModel.findOne({
                stripeSubscriptionId: subscription.id,
            });
            if (purchase) {
                purchase.autoRenew = subscription.cancel_at_period_end === false;
                if (subscription.current_period_end) {
                    purchase.endDate = new Date(subscription.current_period_end * 1000);
                }
                yield purchase.save();
            }
            break;
        }
        case "customer.subscription.deleted": {
            const subscription = event.data.object;
            console.log("Subscription cancelled:", subscription.id);
            yield subscription_model_1.PurchaseModel.updateOne({ stripeSubscriptionId: subscription.id }, {
                isActive: false,
                paymentStatus: "cancelled",
                cancelledAt: new Date(),
            });
            break;
        }
        case "invoice.payment_succeeded": {
            const invoice = event.data.object;
            console.log("Invoice paid:", invoice.id);
            const purchase = yield subscription_model_1.PurchaseModel.findOne({
                stripeSubscriptionId: invoice.subscription,
            });
            if (purchase) {
                purchase.paymentStatus = "completed";
                purchase.isActive = true;
                yield purchase.save();
            }
            break;
        }
        case "invoice.payment_failed": {
            const invoice = event.data.object;
            console.error("Invoice payment failed:", invoice.id);
            const purchase = yield subscription_model_1.PurchaseModel.findOne({
                stripeSubscriptionId: invoice.subscription,
            });
            if (purchase) {
                purchase.paymentStatus = "failed";
                purchase.renewalAttempts += 1;
                if (purchase.renewalAttempts >= 3) {
                    purchase.isActive = false;
                    purchase.paymentStatus = "cancelled";
                    purchase.cancelledAt = new Date();
                }
                yield purchase.save();
            }
            break;
        }
        default:
            console.log(`Received event type: ${event.type}`);
    }
    res.json({ received: true });
});
exports.handleStripeWebhook = handleStripeWebhook;
// Create Stripe checkout session for paid subscription purchase
const createCheckoutSession = (params) => __awaiter(void 0, void 0, void 0, function* () {
    const unitAmount = Math.max(0, Math.round(params.amount * 100));
    if (!config_1.STRIPE_SECRET_KEY) {
        return {
            id: `cs_test_${params.purchaseId}`,
            url: null,
        };
    }
    try {
        const session = yield stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "subscription",
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: `${params.subscriptionName} Plan`,
                        },
                        unit_amount: unitAmount,
                        recurring: { interval: "month" },
                    },
                    quantity: 1,
                },
            ],
            success_url: `${config_1.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${config_1.FRONTEND_URL}/subscription/cancelled`,
            client_reference_id: String(params.userId),
            metadata: {
                userId: String(params.userId),
                subscriptionId: String(params.subscriptionId),
                subscriptionName: String(params.subscriptionName),
                purchaseId: String(params.purchaseId),
                couponCode: params.couponCode ? String(params.couponCode) : "",
            },
        });
        return session;
    }
    catch (error) {
        console.error("Stripe error:", error);
        throw error;
    }
});
exports.createCheckoutSession = createCheckoutSession;
