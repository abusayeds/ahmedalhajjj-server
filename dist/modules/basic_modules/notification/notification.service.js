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
exports.formatNotificationForDashboard = exports.getAppNotifications = exports.deleteNotification = exports.updateNotification = exports.getAdminNotifications = exports.createNotificationRecord = exports.getReachForAudience = exports.getAudienceStats = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const queryBuilder_1 = __importDefault(require("../../../builder/queryBuilder"));
const user_model_1 = require("../user/user.model");
const notification_model_1 = require("./notification.model");
const formatSentLabel = (date) => {
    if (!date)
        return "—";
    return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};
const baseUserFilter = {
    role: "user",
    isDeleted: false,
    status: { $ne: "blocked" },
};
const getAudienceStats = () => __awaiter(void 0, void 0, void 0, function* () {
    const [all, vip, forex, crypto, trial] = yield Promise.all([
        user_model_1.UserModel.countDocuments(baseUserFilter),
        user_model_1.UserModel.countDocuments(Object.assign(Object.assign({}, baseUserFilter), { subscriptionType: "VIP", subscriptionStatus: { $in: ["active", "trial"] } })),
        user_model_1.UserModel.countDocuments(Object.assign(Object.assign({}, baseUserFilter), { subscriptionType: "Forex", subscriptionStatus: { $in: ["active", "trial"] } })),
        user_model_1.UserModel.countDocuments(Object.assign(Object.assign({}, baseUserFilter), { subscriptionType: "Crypto", subscriptionStatus: { $in: ["active", "trial"] } })),
        user_model_1.UserModel.countDocuments(Object.assign(Object.assign({}, baseUserFilter), { subscriptionStatus: "trial" })),
    ]);
    return { all, vip, forex, crypto, trial };
});
exports.getAudienceStats = getAudienceStats;
const getReachForAudience = (audience) => __awaiter(void 0, void 0, void 0, function* () {
    const stats = yield (0, exports.getAudienceStats)();
    switch (audience) {
        case "VIP Users":
            return stats.vip;
        case "Forex Users":
            return stats.forex;
        case "Crypto Users":
            return stats.crypto;
        case "Trial Users":
            return stats.trial;
        default:
            return stats.all;
    }
});
exports.getReachForAudience = getReachForAudience;
const createNotificationRecord = (payload, adminId) => __awaiter(void 0, void 0, void 0, function* () {
    const status = payload.status || "Sent";
    const reach = status === "Sent" ? yield (0, exports.getReachForAudience)(payload.audience) : 0;
    return notification_model_1.NotificationModel.create({
        title: payload.title,
        message: payload.message,
        audience: payload.audience,
        status,
        reach,
        opened: 0,
        scheduledAt: payload.scheduledAt,
        sentAt: status === "Sent" ? new Date() : undefined,
        createdBy: adminId,
    });
});
exports.createNotificationRecord = createNotificationRecord;
const getAdminNotifications = () => __awaiter(void 0, void 0, void 0, function* () {
    return notification_model_1.NotificationModel.find().sort({ createdAt: -1 });
});
exports.getAdminNotifications = getAdminNotifications;
const updateNotification = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const updated = yield notification_model_1.NotificationModel.findByIdAndUpdate(id, payload, {
        new: true,
    });
    if (!updated) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Notification not found.");
    }
    return updated;
});
exports.updateNotification = updateNotification;
const deleteNotification = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const deleted = yield notification_model_1.NotificationModel.findByIdAndDelete(id);
    if (!deleted) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Notification not found.");
    }
    return deleted;
});
exports.deleteNotification = deleteNotification;
const getAudiencesForUser = (user) => {
    const audiences = ["All Users"];
    if (user.subscriptionStatus === "trial") {
        audiences.push("Trial Users");
    }
    if (["active", "trial"].includes(user.subscriptionStatus)) {
        if (user.subscriptionType === "VIP")
            audiences.push("VIP Users");
        if (user.subscriptionType === "Forex")
            audiences.push("Forex Users");
        if (user.subscriptionType === "Crypto")
            audiences.push("Crypto Users");
    }
    return [...new Set(audiences)];
};
const getAppNotifications = (user_1, ...args_1) => __awaiter(void 0, [user_1, ...args_1], void 0, function* (user, query = {}) {
    const audiences = getAudiencesForUser(user);
    const baseFilter = {
        status: "Sent",
        audience: { $in: audiences },
    };
    const builderQuery = Object.assign({}, query);
    if (!builderQuery.sort) {
        builderQuery.sort = "-sentAt";
    }
    const notificationQuery = new queryBuilder_1.default(notification_model_1.NotificationModel.find(baseFilter), builderQuery)
        .search(["title", "message"])
        .filter()
        .sort();
    const { totalData } = yield notificationQuery.paginate(notification_model_1.NotificationModel.find(baseFilter));
    const notifications = yield notificationQuery.modelQuery.exec();
    const currentPage = Number(builderQuery.page) || 1;
    const limit = Number(builderQuery.limit) || 10;
    const pagination = notificationQuery.calculatePagination({
        totalData,
        currentPage,
        limit,
    });
    return { notifications, pagination };
});
exports.getAppNotifications = getAppNotifications;
const formatNotificationForDashboard = (notification) => ({
    id: notification._id,
    _id: notification._id,
    title: notification.title,
    audience: notification.audience,
    sent: formatSentLabel(notification.sentAt || notification.createdAt),
    reach: notification.reach || 0,
    opened: notification.opened || 0,
    status: notification.status,
    message: notification.message,
    scheduledAt: notification.scheduledAt,
});
exports.formatNotificationForDashboard = formatNotificationForDashboard;
