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
exports.getUserTrialStatus = exports.cancelPurchase = exports.updatePurchaseStatus = exports.createPurchase = exports.getUserActiveSubscription = exports.getUserPurchases = exports.updateTrialConfig = exports.getTrialConfig = exports.deleteSubscriptionPlan = exports.updateSubscriptionPlan = exports.createSubscriptionPlan = exports.getSubscriptionById = exports.getAllSubscriptions = void 0;
const subscription_model_1 = require("./subscription.model");
// Subscription Services
const getAllSubscriptions = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield subscription_model_1.SubscriptionModel.find({});
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
    return config;
});
exports.getTrialConfig = getTrialConfig;
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
    const purchase = yield subscription_model_1.PurchaseModel.findOne({
        userId,
        isFreeTrial: true,
    }).sort({ createdAt: -1 });
    if (!purchase) {
        return { hasUsedFreeTrial: false };
    }
    const now = new Date();
    const trialEnded = purchase.freeTrialEndDate && purchase.freeTrialEndDate < now;
    return {
        hasUsedFreeTrial: true,
        isTrialActive: !trialEnded,
        trialEndDate: purchase.freeTrialEndDate,
    };
});
exports.getUserTrialStatus = getUserTrialStatus;
