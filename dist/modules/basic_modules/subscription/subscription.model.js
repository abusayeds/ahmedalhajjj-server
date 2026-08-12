"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrialConfigModel = exports.PurchaseModel = exports.SubscriptionModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const SubscriptionSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    monthly: { type: String },
    yearly: { type: String },
    yearlyEnabled: { type: Boolean, default: true },
    billingCycle: {
        type: String,
        enum: ["monthly", "yearly"],
        default: "monthly",
    },
    features: [{ type: String }],
    maxSignalsPerDay: { type: Number, default: 10 },
    includesGoldSignals: { type: Boolean, default: false },
    includesTechnicalAnalysis: { type: Boolean, default: false },
    includesMarketSentiment: { type: Boolean, default: false },
    includesEconomicCalendar: { type: Boolean, default: false },
    support: {
        type: String,
        default: "basic",
    },
    signalTypes: [{ type: String }],
    allowedCategories: [{ type: String }],
    stripePriceId: { type: String },
    stripeProductId: { type: String },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
const PurchaseSchema = new mongoose_1.Schema({
    userId: {
        type: "ObjectId",
        ref: "User",
        required: true,
    },
    subscriptionId: {
        type: "ObjectId",
        ref: "Subscription",
        required: true,
    },
    subscriptionName: {
        type: String,
        required: true,
    },
    planSnapshot: {
        planName: { type: String },
        subscriptionId: { type: String },
        maxSignalsPerDay: { type: Number },
        signalTypes: [{ type: String }],
        allowedCategories: [{ type: String }],
        includesGoldSignals: { type: Boolean },
        includesTechnicalAnalysis: { type: Boolean },
        includesMarketSentiment: { type: Boolean },
        includesEconomicCalendar: { type: Boolean },
        support: { type: String },
        features: [{ type: String }],
        yearlyEnabled: { type: Boolean },
        priceAtPurchase: { type: Number },
        billingCycle: { type: String, enum: ["monthly", "yearly"] },
        capturedAt: { type: Date },
    },
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String },
    startDate: { type: Date, required: true, default: Date.now },
    endDate: { type: Date, required: true },
    isFreeTrial: { type: Boolean, default: false },
    freeTrialEndDate: { type: Date },
    paymentStatus: {
        type: String,
        enum: ["pending", "completed", "failed", "cancelled"],
        default: "pending",
    },
    amount: { type: Number, required: true },
    billingCycle: {
        type: String,
        enum: ["monthly", "yearly"],
        default: "monthly",
    },
    autoRenew: { type: Boolean, default: true },
    cancelledAt: { type: Date },
    renewalAttempts: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
const TrialConfigSchema = new mongoose_1.Schema({
    promoOn: { type: Boolean, default: true },
    promoLimit: { type: Number, default: 100 },
    promoDuration: { type: String, default: "1 Month (30 Days)" },
    trialOn: { type: Boolean, default: true },
    trialDuration: { type: String, default: "2 Days" },
}, { timestamps: true });
exports.SubscriptionModel = mongoose_1.default.models.Subscription ||
    mongoose_1.default.model("Subscription", SubscriptionSchema);
exports.PurchaseModel = mongoose_1.default.models.Purchase ||
    mongoose_1.default.model("Purchase", PurchaseSchema);
exports.TrialConfigModel = mongoose_1.default.models.TrialConfig ||
    mongoose_1.default.model("TrialConfig", TrialConfigSchema);
