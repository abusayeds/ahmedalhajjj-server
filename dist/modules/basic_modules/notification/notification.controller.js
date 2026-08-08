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
exports.deleteNotificationHandler = exports.updateNotificationHandler = exports.scheduleNotificationHandler = exports.sendNotificationHandler = exports.getNotificationsApp = exports.getNotificationsAdmin = exports.getAudienceStatsHandler = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse"));
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const notification_service_1 = require("./notification.service");
exports.getAudienceStatsHandler = (0, catchAsync_1.default)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const stats = yield (0, notification_service_1.getAudienceStats)();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Audience stats retrieved successfully",
        data: stats,
    });
}));
exports.getNotificationsAdmin = (0, catchAsync_1.default)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const notifications = yield (0, notification_service_1.getAdminNotifications)();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Notifications retrieved successfully",
        data: notifications.map(notification_service_1.formatNotificationForDashboard),
    });
}));
exports.getNotificationsApp = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized");
    }
    const result = yield (0, notification_service_1.getAppNotifications)(req.user, req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Notifications retrieved successfully",
        data: result.notifications.map(notification_service_1.formatNotificationForDashboard),
        pagination: result.pagination,
    });
}));
exports.sendNotificationHandler = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { title, message, audience } = req.body;
    const notification = yield (0, notification_service_1.createNotificationRecord)({
        title,
        message,
        audience,
        status: "Sent",
    }, String((_a = req.user) === null || _a === void 0 ? void 0 : _a._id));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Notification sent successfully",
        data: (0, notification_service_1.formatNotificationForDashboard)(notification),
    });
}));
exports.scheduleNotificationHandler = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { title, message, audience, scheduledAt } = req.body;
    if (!scheduledAt) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Schedule date is required.");
    }
    const notification = yield (0, notification_service_1.createNotificationRecord)({
        title,
        message,
        audience,
        status: "Scheduled",
        scheduledAt: new Date(scheduledAt),
    }, String((_a = req.user) === null || _a === void 0 ? void 0 : _a._id));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Notification scheduled successfully",
        data: (0, notification_service_1.formatNotificationForDashboard)(notification),
    });
}));
exports.updateNotificationHandler = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const notification = yield (0, notification_service_1.updateNotification)(req.params.id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Notification updated successfully",
        data: (0, notification_service_1.formatNotificationForDashboard)(notification),
    });
}));
exports.deleteNotificationHandler = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, notification_service_1.deleteNotification)(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Notification deleted successfully",
        data: null,
    });
}));
