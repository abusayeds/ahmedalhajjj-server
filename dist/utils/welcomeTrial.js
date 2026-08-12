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
exports.resolveWelcomeTrialForRegistration = exports.countFirstPromoRegistrations = exports.ensureRegistrationNumber = exports.getNextRegistrationNumber = exports.parseTrialDurationDays = void 0;
const user_model_1 = require("../modules/basic_modules/user/user.model");
const subscription_model_1 = require("../modules/basic_modules/subscription/subscription.model");
const parseTrialDurationDays = (duration) => {
    const lower = duration.toLowerCase();
    const monthMatch = lower.match(/(\d+)\s*month/);
    if (monthMatch)
        return parseInt(monthMatch[1], 10) * 30;
    const dayMatch = lower.match(/(\d+)\s*day/);
    if (dayMatch)
        return parseInt(dayMatch[1], 10);
    return 2;
};
exports.parseTrialDurationDays = parseTrialDurationDays;
const getNextRegistrationNumber = () => __awaiter(void 0, void 0, void 0, function* () {
    const latest = yield user_model_1.UserModel.findOne({
        role: "user",
        isDeleted: false,
        registrationNumber: { $exists: true, $ne: null },
    })
        .sort({ registrationNumber: -1 })
        .select("registrationNumber");
    return ((latest === null || latest === void 0 ? void 0 : latest.registrationNumber) || 0) + 1;
});
exports.getNextRegistrationNumber = getNextRegistrationNumber;
const ensureRegistrationNumber = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.UserModel.findById(userId).select("registrationNumber createdAt role isDeleted");
    if (!user || user.role !== "user" || user.isDeleted) {
        return 0;
    }
    if (user.registrationNumber) {
        return user.registrationNumber;
    }
    const olderCount = yield user_model_1.UserModel.countDocuments({
        role: "user",
        isDeleted: false,
        _id: { $ne: userId },
        createdAt: { $lt: user.createdAt },
    });
    const registrationNumber = olderCount + 1;
    yield user_model_1.UserModel.findByIdAndUpdate(userId, { registrationNumber });
    return registrationNumber;
});
exports.ensureRegistrationNumber = ensureRegistrationNumber;
const countFirstPromoRegistrations = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (promoLimit = 100) {
    return user_model_1.UserModel.countDocuments({
        role: "user",
        isDeleted: false,
        registrationNumber: { $exists: true, $lte: promoLimit },
    });
});
exports.countFirstPromoRegistrations = countFirstPromoRegistrations;
const resolveWelcomeTrialForRegistration = (registrationNumber) => __awaiter(void 0, void 0, void 0, function* () {
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
    const isPromoUser = config.promoOn && registrationNumber > 0 && registrationNumber <= promoLimit;
    if (isPromoUser) {
        return {
            days: (0, exports.parseTrialDurationDays)(config.promoDuration),
            isPromo: true,
            accessLabel: "promo",
            registrationNumber,
            promoLimit,
        };
    }
    if (!config.trialOn) {
        return null;
    }
    return {
        days: (0, exports.parseTrialDurationDays)(config.trialDuration),
        isPromo: false,
        accessLabel: "trial",
        registrationNumber,
        promoLimit,
    };
});
exports.resolveWelcomeTrialForRegistration = resolveWelcomeTrialForRegistration;
