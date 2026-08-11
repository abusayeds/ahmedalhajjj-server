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
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedSubscriptions = void 0;
const subscription_model_1 = require("./subscription.model");
const seedSubscriptions = () => __awaiter(void 0, void 0, void 0, function* () {
    const existingCount = yield subscription_model_1.SubscriptionModel.countDocuments();
    if (existingCount === 0) {
        const subscriptions = [
            {
                name: "VIP",
                description: "Premium trading signals with all features",
                price: 79,
                billingCycle: "monthly",
                features: [
                    "All signal types: Scalp, Swing, and Long-term",
                    "Up to 10 signals per day (Forex & Crypto)",
                    "Entry/Exit alerts with Stop-Loss protection",
                    "Daily Gold (Metals) signals",
                    "Advanced technical analysis reports",
                    "Market sentiment analysis",
                    "Economic calendar updates",
                    "24/7 Premium Support",
                    "Early access to new features",
                    "Cancel anytime • No commitment required",
                ],
                maxSignalsPerDay: 10,
                includesGoldSignals: true,
                includesTechnicalAnalysis: true,
                includesMarketSentiment: true,
                includesEconomicCalendar: true,
                support: "premium",
                signalTypes: ["Scalp", "Swing", "Long-term"],
                yearlyEnabled: true,
                isActive: true,
            },
            {
                name: "Forex",
                description: "Professional Forex trading signals",
                price: 49,
                billingCycle: "monthly",
                features: [
                    "Scalp and Swing signals",
                    "Up to 5 daily signals",
                    "3–5 Swing signals per week",
                    "Daily Gold (Metals) signals",
                    "Entry/Exit alerts with Stop-Loss protection",
                    "Access to major Forex pairs",
                    "Advanced support",
                    "Cancel anytime • No commitment required",
                ],
                maxSignalsPerDay: 5,
                includesGoldSignals: true,
                includesTechnicalAnalysis: false,
                includesMarketSentiment: false,
                includesEconomicCalendar: false,
                support: "advanced",
                signalTypes: ["Scalp", "Swing"],
                yearlyEnabled: true,
                isActive: true,
            },
            {
                name: "Crypto",
                description: "Cryptocurrency trading signals",
                price: 39,
                billingCycle: "monthly",
                features: [
                    "Scalp and Swing signals",
                    "Up to 5 daily signals",
                    "3–5 Swing signals per week",
                    "Real-time notifications",
                    "Entry/Exit alerts with Stop-Loss protection",
                    "Access to major Crypto pairs",
                    "Advanced support",
                    "Cancel anytime • No commitment required",
                ],
                maxSignalsPerDay: 5,
                includesGoldSignals: false,
                includesTechnicalAnalysis: false,
                includesMarketSentiment: false,
                includesEconomicCalendar: false,
                support: "advanced",
                signalTypes: ["Scalp", "Swing"],
                yearlyEnabled: true,
                isActive: true,
            },
        ];
        yield subscription_model_1.SubscriptionModel.insertMany(subscriptions);
        console.log("✓ Subscription plans seeded successfully");
    }
});
exports.seedSubscriptions = seedSubscriptions;
