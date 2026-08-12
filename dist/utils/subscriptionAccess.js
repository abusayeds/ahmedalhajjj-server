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
exports.getTodayRange = exports.getYesterdayRange = exports.resolveUserAccess = void 0;
const subscription_model_1 = require("../modules/basic_modules/subscription/subscription.model");
const planSnapshot_1 = require("./planSnapshot");
const DEFAULT_SIGNAL_TYPES = {
    VIP: ["Scalp", "Swing", "Intraday", "Position", "Long-term"],
    Forex: ["Scalp", "Swing"],
    Crypto: ["Scalp", "Swing"],
};
const isAccessActive = (user) => {
    if (!user)
        return false;
    if (user.subscriptionStatus === "none" ||
        user.subscriptionStatus === "expired" ||
        user.subscriptionStatus === "cancelled") {
        return false;
    }
    if (user.subscriptionEndDate && new Date(user.subscriptionEndDate) < new Date()) {
        return false;
    }
    return user.subscriptionStatus === "active" || user.subscriptionStatus === "trial";
};
const resolvePlanFromName = (name) => {
    const value = (name || "").toLowerCase();
    if (value.includes("forex"))
        return "Forex";
    if (value.includes("crypto"))
        return "Crypto";
    if (value.includes("vip"))
        return "VIP";
    return null;
};
const buildAccessFromSnapshot = (user, snapshot, plan) => {
    var _a, _b;
    const accessType = user.subscriptionStatus === "trial"
        ? user.promoAccessUsed
            ? "promo"
            : "trial"
        : "paid";
    return {
        plan,
        hasActiveAccess: true,
        canViewTodaySignals: true,
        canViewPremiumContent: true,
        maxSignalsPerDay: snapshot.maxSignalsPerDay,
        allowedCategories: ((_a = snapshot.allowedCategories) === null || _a === void 0 ? void 0 : _a.length)
            ? snapshot.allowedCategories
            : (0, planSnapshot_1.getDefaultCategoriesForPlan)(snapshot.planName),
        allowedSignalTypes: ((_b = snapshot.signalTypes) === null || _b === void 0 ? void 0 : _b.length)
            ? snapshot.signalTypes
            : plan
                ? DEFAULT_SIGNAL_TYPES[plan]
                : [],
        accessType,
        includesGoldSignals: snapshot.includesGoldSignals,
        includesTechnicalAnalysis: snapshot.includesTechnicalAnalysis,
        includesMarketSentiment: snapshot.includesMarketSentiment,
        includesEconomicCalendar: snapshot.includesEconomicCalendar,
        support: snapshot.support,
    };
};
const buildAccessFromLivePlan = (user, plan) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const subscription = yield subscription_model_1.SubscriptionModel.findOne({
        name: plan,
        isActive: { $ne: false },
    });
    const maxSignalsPerDay = (subscription === null || subscription === void 0 ? void 0 : subscription.maxSignalsPerDay) || (plan === "VIP" ? 10 : 5);
    const allowedSignalTypes = ((_a = subscription === null || subscription === void 0 ? void 0 : subscription.signalTypes) === null || _a === void 0 ? void 0 : _a.length)
        ? subscription.signalTypes
        : DEFAULT_SIGNAL_TYPES[plan];
    let allowedCategories = [];
    if ((_b = subscription === null || subscription === void 0 ? void 0 : subscription.allowedCategories) === null || _b === void 0 ? void 0 : _b.length) {
        allowedCategories = subscription.allowedCategories;
    }
    else if (plan === "VIP") {
        allowedCategories = ["Forex", "Crypto", "Commodity", "Index"];
    }
    else if (plan === "Forex") {
        allowedCategories = ["Forex", "Commodity"];
    }
    else if (plan === "Crypto") {
        allowedCategories = ["Crypto"];
    }
    const accessType = user.subscriptionStatus === "trial"
        ? user.promoAccessUsed
            ? "promo"
            : "trial"
        : "paid";
    return {
        plan,
        hasActiveAccess: true,
        canViewTodaySignals: true,
        canViewPremiumContent: true,
        maxSignalsPerDay,
        allowedCategories,
        allowedSignalTypes,
        accessType,
        includesGoldSignals: subscription === null || subscription === void 0 ? void 0 : subscription.includesGoldSignals,
        includesTechnicalAnalysis: subscription === null || subscription === void 0 ? void 0 : subscription.includesTechnicalAnalysis,
        includesMarketSentiment: subscription === null || subscription === void 0 ? void 0 : subscription.includesMarketSentiment,
        includesEconomicCalendar: subscription === null || subscription === void 0 ? void 0 : subscription.includesEconomicCalendar,
        support: subscription === null || subscription === void 0 ? void 0 : subscription.support,
    };
});
const resolveUserAccess = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const active = isAccessActive(user);
    const plan = user.subscriptionType || null;
    if (!active || !plan) {
        return {
            plan: null,
            hasActiveAccess: false,
            canViewTodaySignals: false,
            canViewPremiumContent: false,
            maxSignalsPerDay: 0,
            allowedCategories: [],
            allowedSignalTypes: [],
            accessType: "none",
        };
    }
    if (user.currentSubscription) {
        const purchase = yield subscription_model_1.PurchaseModel.findById(user.currentSubscription).select("planSnapshot subscriptionName isActive paymentStatus");
        if ((purchase === null || purchase === void 0 ? void 0 : purchase.planSnapshot) &&
            purchase.isActive &&
            purchase.paymentStatus === "completed") {
            const snapshotPlan = resolvePlanFromName(purchase.planSnapshot.planName) || plan;
            return buildAccessFromSnapshot(user, purchase.planSnapshot, snapshotPlan);
        }
    }
    return buildAccessFromLivePlan(user, plan);
});
exports.resolveUserAccess = resolveUserAccess;
const getYesterdayRange = () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 1);
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);
    return { start, end };
};
exports.getYesterdayRange = getYesterdayRange;
const getTodayRange = () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { start, end };
};
exports.getTodayRange = getTodayRange;
