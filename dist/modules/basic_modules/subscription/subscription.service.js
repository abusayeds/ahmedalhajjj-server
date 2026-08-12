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
exports.initiateSubscriptionPurchase = exports.autoActivateWelcomeTrial = exports.getFreeTrialEligibility = exports.getUserTrialStatus = exports.cancelPurchase = exports.updatePurchaseStatus = exports.createPurchase = exports.getUserActiveSubscription = exports.getUserPurchases = exports.updateTrialConfig = exports.getSubscriptionStats = exports.getTrialConfig = exports.deleteSubscriptionPlan = exports.updateSubscriptionPlan = exports.createSubscriptionPlan = exports.getSubscriptionById = exports.getAllSubscriptions = void 0;
const subscription_model_1 = require("./subscription.model");
const user_model_1 = require("../user/user.model");
const coupon_service_1 = require("../coupon/coupon.service");
const stripe_service_1 = require("../../payment/stripe.service");
const planSnapshot_1 = require("../../../utils/planSnapshot");
const welcomeTrial_1 = require("../../../utils/welcomeTrial");
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
// Subscription Services
const getAllSubscriptions = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (includeDisabled = false) {
    if (includeDisabled) {
        return yield subscription_model_1.SubscriptionModel.find({});
    }
    return yield subscription_model_1.SubscriptionModel.find({ isActive: { $ne: false } });
});
exports.getAllSubscriptions = getAllSubscriptions;
const getSubscriptionById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield subscription_model_1.SubscriptionModel.findById(id);
});
exports.getSubscriptionById = getSubscriptionById;
const createSubscriptionPlan = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const subscription = new subscription_model_1.SubscriptionModel(data);
    return yield subscription.save();
});
exports.createSubscriptionPlan = createSubscriptionPlan;
const updateSubscriptionPlan = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    return yield subscription_model_1.SubscriptionModel.findByIdAndUpdate(id, data, { new: true });
});
exports.updateSubscriptionPlan = updateSubscriptionPlan;
const deleteSubscriptionPlan = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield subscription_model_1.SubscriptionModel.findByIdAndDelete(id);
});
exports.deleteSubscriptionPlan = deleteSubscriptionPlan;
// Trial & Promo Configuration Services
const getTrialConfig = () => __awaiter(void 0, void 0, void 0, function* () {
    let config = yield subscription_model_1.TrialConfigModel.findOne({});
    if (!config) {
        config = yield subscription_model_1.TrialConfigModel.create({
            promoOn: true,
            promoLimit: 100,
            promoDuration: "1 Month (30 Days)",
            trialOn: true,
            trialDuration: "2 Days",
        });
    }
    const promoLimit = config.promoLimit || 100;
    const claimedCount = yield (0, welcomeTrial_1.countFirstPromoRegistrations)(promoLimit);
    const subscriptionStats = yield (0, exports.getSubscriptionStats)();
    return Object.assign(Object.assign({}, config.toObject()), { claimedCount,
        subscriptionStats });
});
exports.getTrialConfig = getTrialConfig;
const getSubscriptionStats = () => __awaiter(void 0, void 0, void 0, function* () {
    const baseFilter = {
        role: "user",
        isDeleted: false,
        status: { $ne: "blocked" },
        subscriptionStatus: { $in: ["active", "trial"] },
    };
    const [vip, forex, crypto, total] = yield Promise.all([
        user_model_1.UserModel.countDocuments(Object.assign(Object.assign({}, baseFilter), { subscriptionType: "VIP" })),
        user_model_1.UserModel.countDocuments(Object.assign(Object.assign({}, baseFilter), { subscriptionType: "Forex" })),
        user_model_1.UserModel.countDocuments(Object.assign(Object.assign({}, baseFilter), { subscriptionType: "Crypto" })),
        user_model_1.UserModel.countDocuments({ role: "user", isDeleted: false }),
    ]);
    return { vip, forex, crypto, total };
});
exports.getSubscriptionStats = getSubscriptionStats;
const updateTrialConfig = (data) => __awaiter(void 0, void 0, void 0, function* () {
    let config = yield subscription_model_1.TrialConfigModel.findOne({});
    if (!config) {
        config = new subscription_model_1.TrialConfigModel(data);
    }
    else {
        Object.assign(config, data);
    }
    return yield config.save();
});
exports.updateTrialConfig = updateTrialConfig;
// Purchase Services
const getUserPurchases = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield subscription_model_1.PurchaseModel.find({ userId }).populate("subscriptionId");
});
exports.getUserPurchases = getUserPurchases;
const getUserActiveSubscription = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield subscription_model_1.PurchaseModel.findOne({
        userId,
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
    }).populate("subscriptionId");
});
exports.getUserActiveSubscription = getUserActiveSubscription;
const createPurchase = (purchaseData) => __awaiter(void 0, void 0, void 0, function* () {
    const purchase = new subscription_model_1.PurchaseModel(purchaseData);
    return yield purchase.save();
});
exports.createPurchase = createPurchase;
const updatePurchaseStatus = (purchaseId, status) => __awaiter(void 0, void 0, void 0, function* () {
    return yield subscription_model_1.PurchaseModel.findByIdAndUpdate(purchaseId, { paymentStatus: status }, { new: true });
});
exports.updatePurchaseStatus = updatePurchaseStatus;
const cancelPurchase = (purchaseId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield subscription_model_1.PurchaseModel.findByIdAndUpdate(purchaseId, { isActive: false, cancelledAt: new Date() }, { new: true });
});
exports.cancelPurchase = cancelPurchase;
const getUserTrialStatus = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const eligibility = yield (0, exports.getFreeTrialEligibility)(userId);
    const purchase = yield subscription_model_1.PurchaseModel.findOne({
        userId,
        isFreeTrial: true,
        paymentStatus: "completed",
    }).sort({ createdAt: -1 });
    if (!purchase) {
        return {
            hasUsedFreeTrial: eligibility.hasUsedFreeTrial,
            canStartFreeTrial: eligibility.canStart,
            reason: eligibility.reason,
        };
    }
    const now = new Date();
    const trialEnded = purchase.freeTrialEndDate && purchase.freeTrialEndDate < now;
    return {
        hasUsedFreeTrial: true,
        isTrialActive: !trialEnded,
        trialEndDate: purchase.freeTrialEndDate,
        canStartFreeTrial: eligibility.canStart,
        reason: eligibility.reason,
    };
});
exports.getUserTrialStatus = getUserTrialStatus;
const getFreeTrialEligibility = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.UserModel.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found.");
    }
    const configDoc = yield subscription_model_1.TrialConfigModel.findOne({});
    const config = configDoc || {
        promoOn: true,
        promoLimit: 100,
        promoDuration: "1 Month (30 Days)",
        trialOn: true,
        trialDuration: "2 Days",
    };
    const trialPurchase = yield subscription_model_1.PurchaseModel.findOne({
        userId,
        isFreeTrial: true,
        paymentStatus: "completed",
    });
    const hasUsedFreeTrial = Boolean(trialPurchase);
    const activePaidPurchase = yield subscription_model_1.PurchaseModel.findOne({
        userId,
        isFreeTrial: false,
        paymentStatus: "completed",
        isActive: true,
        endDate: { $gte: new Date() },
    });
    const hasActivePaidSubscription = Boolean(activePaidPurchase) ||
        (user.subscriptionStatus === "active" &&
            Boolean(user.subscriptionEndDate) &&
            new Date(user.subscriptionEndDate) >= new Date());
    const hasActiveTrial = user.subscriptionStatus === "trial" &&
        Boolean(user.subscriptionEndDate) &&
        new Date(user.subscriptionEndDate) >= new Date();
    if (hasUsedFreeTrial || hasActiveTrial || user.hasUsedFreeAccess) {
        return {
            canStart: false,
            reason: "You have already used your free trial on this account.",
            hasUsedFreeTrial: true,
            hasActivePaidSubscription,
            hasUsedFreeAccess: user.hasUsedFreeAccess,
        };
    }
    if (hasActivePaidSubscription) {
        return {
            canStart: false,
            reason: "You already have an active paid subscription. Free trial is available only before your first paid plan or after it expires.",
            hasUsedFreeTrial: false,
            hasActivePaidSubscription: true,
            hasUsedFreeAccess: user.hasUsedFreeAccess,
        };
    }
    const registrationNumber = yield (0, welcomeTrial_1.ensureRegistrationNumber)(userId);
    const isPromoEligible = config.promoOn && registrationNumber > 0 && registrationNumber <= (config.promoLimit || 100);
    if (!isPromoEligible && !config.trialOn) {
        return {
            canStart: false,
            reason: "Free trial is currently unavailable.",
            hasUsedFreeTrial: false,
            hasActivePaidSubscription: false,
            hasUsedFreeAccess: user.hasUsedFreeAccess,
        };
    }
    return {
        canStart: true,
        reason: null,
        hasUsedFreeTrial: false,
        hasActivePaidSubscription: false,
        hasUsedFreeAccess: user.hasUsedFreeAccess,
        registrationNumber,
        isPromoEligible,
        trialOn: config.trialOn,
    };
});
exports.getFreeTrialEligibility = getFreeTrialEligibility;
const calculateDiscountedAmount = (price, coupon) => {
    if (!coupon)
        return price;
    if (coupon.discountType === "fixed") {
        return Math.max(0, price - Number(coupon.discount));
    }
    return Math.max(0, price * (1 - Number(coupon.discount) / 100));
};
const resolveTrialAccess = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const eligibility = yield (0, exports.getFreeTrialEligibility)(userId);
    if (!eligibility.canStart) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, eligibility.reason || "Free trial is not available for this account.");
    }
    const registrationNumber = yield (0, welcomeTrial_1.ensureRegistrationNumber)(userId);
    const trialAccess = yield (0, welcomeTrial_1.resolveWelcomeTrialForRegistration)(registrationNumber);
    if (!trialAccess) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Free trial is currently unavailable.");
    }
    return trialAccess;
});
const activateFreeTrialPurchase = (userId_1, subscription_1, ...args_1) => __awaiter(void 0, [userId_1, subscription_1, ...args_1], void 0, function* (userId, subscription, billingCycle = "monthly") {
    const trialAccess = yield resolveTrialAccess(userId);
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + trialAccess.days);
    yield subscription_model_1.PurchaseModel.updateMany({ userId, isActive: true }, { $set: { isActive: false } });
    const purchase = yield subscription_model_1.PurchaseModel.create({
        userId,
        subscriptionId: subscription._id,
        subscriptionName: subscription.name,
        planSnapshot: (0, planSnapshot_1.buildPlanSnapshot)(subscription, billingCycle),
        isFreeTrial: true,
        paymentStatus: "completed",
        isActive: true,
        amount: 0,
        startDate: new Date(),
        endDate: trialEndDate,
        freeTrialEndDate: trialEndDate,
        billingCycle,
    });
    yield user_model_1.UserModel.findByIdAndUpdate(userId, {
        subscriptionType: subscription.name,
        subscriptionStatus: "trial",
        subscriptionEndDate: trialEndDate,
        freeTrialEndDate: trialEndDate,
        hasUsedFreeAccess: true,
        promoAccessUsed: trialAccess.isPromo,
        currentSubscription: purchase._id,
    });
    return { purchase, trialAccess, trialEndDate };
});
const autoActivateWelcomeTrial = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.UserModel.findById(userId);
    if (!user || user.role !== "user" || user.isDeleted) {
        return null;
    }
    const eligibility = yield (0, exports.getFreeTrialEligibility)(userId);
    if (!eligibility.canStart) {
        return null;
    }
    const subscription = (yield subscription_model_1.SubscriptionModel.findOne({ name: "VIP", isActive: { $ne: false } })) ||
        (yield subscription_model_1.SubscriptionModel.findOne({ isActive: { $ne: false } }).sort({ createdAt: 1 }));
    if (!subscription) {
        return null;
    }
    const { purchase, trialAccess } = yield activateFreeTrialPurchase(userId, subscription, "monthly");
    return {
        purchase,
        accessType: trialAccess.accessLabel,
        trialDays: trialAccess.days,
        registrationNumber: trialAccess.registrationNumber,
        planName: subscription.name,
    };
});
exports.autoActivateWelcomeTrial = autoActivateWelcomeTrial;
const initiateSubscriptionPurchase = (userId_1, subscriptionId_1, ...args_1) => __awaiter(void 0, [userId_1, subscriptionId_1, ...args_1], void 0, function* (userId, subscriptionId, options = {}) {
    const normalizedUserId = String(userId);
    const normalizedSubscriptionId = String(subscriptionId);
    const subscription = yield subscription_model_1.SubscriptionModel.findById(normalizedSubscriptionId);
    if (!subscription || subscription.isActive === false) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Subscription plan not found or inactive.");
    }
    let coupon = null;
    if (options.couponCode) {
        try {
            coupon = yield (0, coupon_service_1.validateAndApplyCoupon)(options.couponCode);
            if (coupon.applicablePlans &&
                coupon.applicablePlans.length > 0 &&
                !coupon.applicablePlans.includes(subscription.name)) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `Coupon is not applicable to ${subscription.name} plan.`);
            }
        }
        catch (error) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, error.message || "Invalid coupon code.");
        }
    }
    const subscriptionName = subscription.name;
    const billingCycle = options.billingCycle || "monthly";
    if (billingCycle === "yearly" && subscription.yearlyEnabled === false) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Yearly billing is not available for this subscription plan.");
    }
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    if (options.isFreeTrial) {
        const { purchase, trialAccess } = yield activateFreeTrialPurchase(normalizedUserId, subscription, billingCycle);
        return {
            purchase,
            checkoutUrl: null,
            sessionId: null,
            finalAmount: 0,
            couponApplied: null,
            paymentRequired: false,
            accessType: trialAccess.accessLabel,
            trialDays: trialAccess.days,
            registrationNumber: trialAccess.registrationNumber,
            nextStep: trialAccess.isPromo
                ? `1-month free access activated for user #${trialAccess.registrationNumber}.`
                : `2-day free trial activated for user #${trialAccess.registrationNumber}.`,
        };
    }
    const finalAmount = calculateDiscountedAmount(subscription.price, coupon);
    if (finalAmount === 0) {
        yield subscription_model_1.PurchaseModel.updateMany({ userId: normalizedUserId, isActive: true }, { $set: { isActive: false } });
    }
    const purchase = yield subscription_model_1.PurchaseModel.create({
        userId: normalizedUserId,
        subscriptionId: normalizedSubscriptionId,
        subscriptionName,
        planSnapshot: (0, planSnapshot_1.buildPlanSnapshot)(subscription, billingCycle),
        isFreeTrial: false,
        paymentStatus: finalAmount === 0 ? "completed" : "pending",
        isActive: finalAmount === 0,
        amount: finalAmount,
        startDate: new Date(),
        endDate,
        billingCycle,
    });
    if (finalAmount === 0) {
        yield user_model_1.UserModel.findByIdAndUpdate(normalizedUserId, {
            subscriptionType: subscriptionName,
            subscriptionStatus: "active",
            subscriptionEndDate: endDate,
            currentSubscription: purchase._id,
        });
        if (coupon && options.couponCode) {
            coupon.used = (coupon.used || 0) + 1;
            if (coupon.used >= coupon.limit) {
                coupon.status = "Exhausted";
            }
            yield coupon.save();
        }
        return {
            purchase,
            checkoutUrl: null,
            sessionId: null,
            finalAmount,
            couponApplied: (coupon === null || coupon === void 0 ? void 0 : coupon.code) || null,
            paymentRequired: false,
            nextStep: "Subscription activated immediately (100% coupon discount).",
        };
    }
    const session = yield (0, stripe_service_1.createCheckoutSession)({
        userId: normalizedUserId,
        subscriptionId: normalizedSubscriptionId,
        subscriptionName,
        amount: finalAmount,
        purchaseId: String(purchase._id),
        couponCode: options.couponCode,
    });
    return {
        purchase,
        checkoutUrl: session.url,
        sessionId: session.id,
        finalAmount,
        couponApplied: (coupon === null || coupon === void 0 ? void 0 : coupon.code) || null,
        paymentRequired: true,
        nextStep: "Complete payment on Stripe checkout URL, then Stripe webhook will activate the subscription.",
    };
});
exports.initiateSubscriptionPurchase = initiateSubscriptionPurchase;
