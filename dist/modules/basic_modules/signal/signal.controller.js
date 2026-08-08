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
exports.duplicateSignalHandler = exports.archiveSignalHandler = exports.closeSignalHandler = exports.publishSignalHandler = exports.deleteSignalHandler = exports.updateSignalHandler = exports.createSignalHandler = exports.getSignalsApp = exports.getMarketHoursHandler = exports.getSignalsAdmin = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse"));
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const signal_service_1 = require("./signal.service");
const marketHours_1 = require("../../../utils/marketHours");
exports.getSignalsAdmin = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const signals = yield (0, signal_service_1.getAdminSignals)(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Signals retrieved successfully",
        data: signals.map(signal_service_1.formatSignalForDashboard),
    });
}));
exports.getMarketHoursHandler = (0, catchAsync_1.default)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Global market hours retrieved successfully",
        data: (0, marketHours_1.getGlobalMarketHours)(),
    });
}));
exports.getSignalsApp = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized");
    }
    const result = yield (0, signal_service_1.getAppSignals)(req.user, req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: result.message,
        data: {
            access: result.access,
            signals: result.signals.map(signal_service_1.formatSignalForApp),
        },
        pagination: result.pagination,
    });
}));
exports.createSignalHandler = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const signal = yield (0, signal_service_1.createSignal)(req.body, String((_a = req.user) === null || _a === void 0 ? void 0 : _a._id));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Signal created successfully",
        data: (0, signal_service_1.formatSignalForDashboard)(signal),
    });
}));
exports.updateSignalHandler = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const signal = yield (0, signal_service_1.updateSignal)(req.params.id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Signal updated successfully",
        data: (0, signal_service_1.formatSignalForDashboard)(signal),
    });
}));
exports.deleteSignalHandler = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, signal_service_1.deleteSignal)(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Signal deleted successfully",
        data: null,
    });
}));
exports.publishSignalHandler = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const signal = yield (0, signal_service_1.publishSignal)(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Signal published successfully",
        data: (0, signal_service_1.formatSignalForDashboard)(signal),
    });
}));
exports.closeSignalHandler = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { closeResult, closePnl } = req.body;
    const signal = yield (0, signal_service_1.closeSignal)(req.params.id, closeResult, closePnl);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Signal closed successfully",
        data: (0, signal_service_1.formatSignalForDashboard)(signal),
    });
}));
exports.archiveSignalHandler = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const signal = yield (0, signal_service_1.archiveSignal)(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Signal archived successfully",
        data: (0, signal_service_1.formatSignalForDashboard)(signal),
    });
}));
exports.duplicateSignalHandler = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const signal = yield (0, signal_service_1.duplicateSignal)(req.params.id, String((_a = req.user) === null || _a === void 0 ? void 0 : _a._id));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Signal duplicated successfully",
        data: (0, signal_service_1.formatSignalForDashboard)(signal),
    });
}));
