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
exports.initiatePurchase = exports.getTrialStatus = exports.getCurrentSubscription = exports.getUserSubscriptions = exports.updateTrialConfigHandler = exports.getTrialConfigHandler = exports.deleteSubscription = exports.updateSubscription = exports.createSubscription = exports.getSubscriptionDetail = exports.getSubscriptions = void 0;
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse"));
const subscription_service_1 = require("./subscription.service");
exports.getSubscriptions = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const isAdmin = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === "admin";
    const includeDisabled = req.query.includeDisabled === "true" || isAdmin;
    const subscriptions = yield (0, subscription_service_1.getAllSubscriptions)(includeDisabled);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Subscriptions retrieved successfully",
        data: subscriptions,
    });
}));
exports.getSubscriptionDetail = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const subscription = yield (0, subscription_service_1.getSubscriptionById)(id);
    if (!subscription) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 404,
            success: false,
            message: "Subscription not found",
            data: null,
        });
    }
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Subscription retrieved successfully",
        data: subscription,
    });
}));
exports.createSubscription = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const subscription = yield (0, subscription_service_1.createSubscriptionPlan)(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "Subscription plan created successfully",
        data: subscription,
    });
}));
exports.updateSubscription = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const subscription = yield (0, subscription_service_1.updateSubscriptionPlan)(id, req.body);
    if (!subscription) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 404,
            success: false,
            message: "Subscription plan not found",
            data: null,
        });
    }
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Subscription plan updated successfully",
        data: subscription,
    });
}));
exports.deleteSubscription = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const subscription = yield (0, subscription_service_1.deleteSubscriptionPlan)(id);
    if (!subscription) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 404,
            success: false,
            message: "Subscription plan not found",
            data: null,
        });
    }
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Subscription plan deleted successfully",
        data: subscription,
    });
}));
exports.getTrialConfigHandler = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const config = yield (0, subscription_service_1.getTrialConfig)();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Trial and Promo configuration retrieved successfully",
        data: config,
    });
}));
exports.updateTrialConfigHandler = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const config = yield (0, subscription_service_1.updateTrialConfig)(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Trial and Promo configuration updated successfully",
        data: config,
    });
}));
exports.getUserSubscriptions = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = String(((_a = req.user) === null || _a === void 0 ? void 0 : _a._id) || "");
    if (!userId) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 401,
            success: false,
            message: "Unauthorized",
            data: null,
        });
    }
    const purchases = yield (0, subscription_service_1.getUserPurchases)(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "User subscriptions retrieved",
        data: purchases,
    });
}));
exports.getCurrentSubscription = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = String(((_a = req.user) === null || _a === void 0 ? void 0 : _a._id) || "");
    if (!userId) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 401,
            success: false,
            message: "Unauthorized",
            data: null,
        });
    }
    const subscription = yield (0, subscription_service_1.getUserActiveSubscription)(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: subscription
            ? "Active subscription found"
            : "No active subscription",
        data: subscription,
    });
}));
exports.getTrialStatus = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    if (!userId) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 401,
            success: false,
            message: "Unauthorized",
            data: null,
        });
    }
    const trialStatus = yield (0, subscription_service_1.getUserTrialStatus)(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Trial status retrieved",
        data: trialStatus,
    });
}));
exports.initiatePurchase = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = String(((_a = req.user) === null || _a === void 0 ? void 0 : _a._id) || "");
    const { subscriptionId, isFreeTrial, couponCode, billingCycle } = req.body;
    if (!userId) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 401,
            success: false,
            message: "Unauthorized",
            data: null,
        });
    }
    if (!subscriptionId) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 400,
            success: false,
            message: "Subscription ID is required",
            data: null,
        });
    }
    if (isFreeTrial) {
        const eligibility = yield (0, subscription_service_1.getFreeTrialEligibility)(userId);
        if (!eligibility.canStart) {
            return (0, sendResponse_1.default)(res, {
                statusCode: 400,
                success: false,
                message: eligibility.reason || "Free trial is not available for this account.",
                data: eligibility,
            });
        }
    }
    const result = yield (0, subscription_service_1.initiateSubscriptionPurchase)(userId, subscriptionId, {
        isFreeTrial: Boolean(isFreeTrial),
        couponCode,
        billingCycle,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: result.paymentRequired
            ? "Purchase initiated. Complete Stripe payment, then webhook will activate subscription."
            : "Subscription activated successfully.",
        data: result,
    });
}));
