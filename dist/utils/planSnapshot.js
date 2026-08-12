"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPlanSnapshot = exports.getDefaultCategoriesForPlan = exports.SIGNAL_CATEGORIES = void 0;
exports.SIGNAL_CATEGORIES = ["Forex", "Crypto", "Commodity", "Index"];
const getDefaultCategoriesForPlan = (planName) => {
    const name = planName.toLowerCase();
    if (name.includes("forex"))
        return ["Forex", "Commodity"];
    if (name.includes("crypto"))
        return ["Crypto"];
    return ["Forex", "Crypto", "Commodity", "Index"];
};
exports.getDefaultCategoriesForPlan = getDefaultCategoriesForPlan;
const buildPlanSnapshot = (subscription, billingCycle = "monthly") => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const planName = subscription.name;
    return {
        planName,
        subscriptionId: String(subscription._id),
        maxSignalsPerDay: (_a = subscription.maxSignalsPerDay) !== null && _a !== void 0 ? _a : (planName === "VIP" ? 10 : 5),
        signalTypes: ((_b = subscription.signalTypes) === null || _b === void 0 ? void 0 : _b.length) ? [...subscription.signalTypes] : [],
        allowedCategories: ((_c = subscription.allowedCategories) === null || _c === void 0 ? void 0 : _c.length)
            ? [...subscription.allowedCategories]
            : (0, exports.getDefaultCategoriesForPlan)(planName),
        includesGoldSignals: (_d = subscription.includesGoldSignals) !== null && _d !== void 0 ? _d : false,
        includesTechnicalAnalysis: (_e = subscription.includesTechnicalAnalysis) !== null && _e !== void 0 ? _e : false,
        includesMarketSentiment: (_f = subscription.includesMarketSentiment) !== null && _f !== void 0 ? _f : false,
        includesEconomicCalendar: (_g = subscription.includesEconomicCalendar) !== null && _g !== void 0 ? _g : false,
        support: subscription.support || "basic",
        features: ((_h = subscription.features) === null || _h === void 0 ? void 0 : _h.length) ? [...subscription.features] : [],
        yearlyEnabled: subscription.yearlyEnabled !== false,
        priceAtPurchase: subscription.price,
        billingCycle,
        capturedAt: new Date(),
    };
};
exports.buildPlanSnapshot = buildPlanSnapshot;
