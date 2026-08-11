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
const DEFAULT_SIGNAL_TYPES = {
    VIP: ["Scalp", "Swing", "Intraday", "Position", "Long-term"],
    Forex: ["Scalp", "Swing"],
    Crypto: ["Scalp", "Swing"],
};
const isAccessActive = (user) => {
    if (!user)
        return false;
    if (user.subscriptionStatus === "none" || user.subscriptionStatus === "expired" || user.subscriptionStatus === "cancelled") {
        return false;
    }
    if (user.subscriptionEndDate && new Date(user.subscriptionEndDate) < new Date()) {
        return false;
    }
    return user.subscriptionStatus === "active" || user.subscriptionStatus === "trial";
};
const resolveUserAccess = (user) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
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
    const subscription = yield subscription_model_1.SubscriptionModel.findOne({ name: plan, isActive: { $ne: false } });
    const maxSignalsPerDay = (subscription === null || subscription === void 0 ? void 0 : subscription.maxSignalsPerDay) || (plan === "VIP" ? 10 : 5);
    const allowedSignalTypes = ((_a = subscription === null || subscription === void 0 ? void 0 : subscription.signalTypes) === null || _a === void 0 ? void 0 : _a.length)
        ? subscription.signalTypes
        : DEFAULT_SIGNAL_TYPES[plan];
    let allowedCategories = [];
    if (plan === "VIP") {
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
    };
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
