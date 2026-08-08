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
exports.getAppSignals = exports.duplicateSignal = exports.archiveSignal = exports.closeSignal = exports.publishSignal = exports.deleteSignal = exports.updateSignal = exports.createSignal = exports.getAdminSignals = exports.formatSignalForDashboard = exports.formatSignalForApp = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const queryBuilder_1 = __importDefault(require("../../../builder/queryBuilder"));
const subscriptionAccess_1 = require("../../../utils/subscriptionAccess");
const signal_model_1 = require("./signal.model");
const signalType_service_1 = require("./signalType.service");
var signal_formatter_1 = require("./signal.formatter");
Object.defineProperty(exports, "formatSignalForApp", { enumerable: true, get: function () { return signal_formatter_1.formatSignalForApp; } });
Object.defineProperty(exports, "formatSignalForDashboard", { enumerable: true, get: function () { return signal_formatter_1.formatSignalForDashboard; } });
const normalizeSignalPayload = (payload) => {
    const data = Object.assign({}, payload);
    if (payload.category === "Commodity") {
        data.isGoldSignal = true;
    }
    if (payload.status === "Active" && !payload.publishedAt) {
        data.publishedAt = new Date();
        data.signalDate = new Date();
    }
    if (payload.status === "Scheduled" && payload.scheduledAt) {
        data.signalDate = new Date(payload.scheduledAt);
    }
    return data;
};
const getAdminSignals = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const filter = { status: { $ne: "Archived" } };
    if (query.status && query.status !== "All") {
        filter.status = query.status;
    }
    if (query.searchTerm) {
        filter.asset = { $regex: String(query.searchTerm), $options: "i" };
    }
    return signal_model_1.SignalModel.find(filter).sort({ createdAt: -1 });
});
exports.getAdminSignals = getAdminSignals;
const createSignal = (payload, adminId) => __awaiter(void 0, void 0, void 0, function* () {
    const data = normalizeSignalPayload(payload);
    if (payload.type) {
        data.type = yield (0, signalType_service_1.assertActiveSignalType)(payload.type);
    }
    return signal_model_1.SignalModel.create(Object.assign(Object.assign({}, data), { createdBy: adminId }));
});
exports.createSignal = createSignal;
const updateSignal = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const data = normalizeSignalPayload(payload);
    if (payload.type) {
        data.type = yield (0, signalType_service_1.assertActiveSignalType)(payload.type);
    }
    const updated = yield signal_model_1.SignalModel.findByIdAndUpdate(id, data, { new: true });
    if (!updated) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Signal not found.");
    }
    return updated;
});
exports.updateSignal = updateSignal;
const deleteSignal = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const deleted = yield signal_model_1.SignalModel.findByIdAndDelete(id);
    if (!deleted) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Signal not found.");
    }
    return deleted;
});
exports.deleteSignal = deleteSignal;
const publishSignal = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, exports.updateSignal)(id, {
        status: "Active",
        publishedAt: new Date(),
        signalDate: new Date(),
    });
});
exports.publishSignal = publishSignal;
const closeSignal = (id, closeResult, closePnl) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, exports.updateSignal)(id, {
        status: "Closed",
        closeResult,
        closePnl,
    });
});
exports.closeSignal = closeSignal;
const archiveSignal = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, exports.updateSignal)(id, { status: "Archived" });
});
exports.archiveSignal = archiveSignal;
const duplicateSignal = (id, adminId) => __awaiter(void 0, void 0, void 0, function* () {
    const source = yield signal_model_1.SignalModel.findById(id);
    if (!source) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Signal not found.");
    }
    const copy = source.toObject();
    delete copy._id;
    delete copy.createdAt;
    delete copy.updatedAt;
    return signal_model_1.SignalModel.create(Object.assign(Object.assign({}, copy), { status: "Draft", publishedAt: undefined, closeResult: undefined, closePnl: undefined, createdBy: adminId }));
});
exports.duplicateSignal = duplicateSignal;
const buildAppSignalFilter = (access, query) => {
    const andConditions = [{ status: "Active" }];
    if (!access.hasActiveAccess) {
        const { start, end } = (0, subscriptionAccess_1.getYesterdayRange)();
        andConditions.push({ signalDate: { $gte: start, $lte: end } });
    }
    else {
        const { start, end } = (0, subscriptionAccess_1.getTodayRange)();
        andConditions.push({ signalDate: { $gte: start, $lte: end } });
        if (access.allowedCategories.length) {
            andConditions.push({ category: { $in: access.allowedCategories } });
        }
        if (access.allowedSignalTypes.length) {
            andConditions.push((0, signalType_service_1.buildSignalTypeMatchFilter)(access.allowedSignalTypes));
        }
        else {
            andConditions.push({ type: { $in: [] } });
        }
    }
    const category = String(query.category || "All");
    if (category && category !== "All") {
        if (category === "Gold") {
            andConditions.push({ isGoldSignal: true });
        }
        else {
            andConditions.push({ category });
        }
    }
    return andConditions.length === 1 ? andConditions[0] : { $and: andConditions };
};
const normalizeSignalQuery = (query) => {
    const builderQuery = Object.assign({}, query);
    if (query.search && !query.searchTerm) {
        builderQuery.searchTerm = query.search;
    }
    if (!builderQuery.sort) {
        builderQuery.sort = "-publishedAt";
    }
    delete builderQuery.category;
    delete builderQuery.search;
    delete builderQuery.scope;
    return builderQuery;
};
const getAppSignals = (user_1, ...args_1) => __awaiter(void 0, [user_1, ...args_1], void 0, function* (user, query = {}) {
    const access = yield (0, subscriptionAccess_1.resolveUserAccess)(user);
    const baseFilter = buildAppSignalFilter(access, query);
    const builderQuery = normalizeSignalQuery(query);
    let limit = Number(builderQuery.limit) || 10;
    if (access.hasActiveAccess && access.maxSignalsPerDay > 0) {
        limit = Math.min(limit, access.maxSignalsPerDay);
        builderQuery.limit = limit;
    }
    const signalQuery = new queryBuilder_1.default(signal_model_1.SignalModel.find(baseFilter), builderQuery)
        .search(["asset", "type"])
        .filter()
        .sort();
    const { totalData } = yield signalQuery.paginate(signal_model_1.SignalModel.find(baseFilter));
    const signals = yield signalQuery.modelQuery.exec();
    const currentPage = Number(builderQuery.page) || 1;
    const pagination = signalQuery.calculatePagination({
        totalData,
        currentPage,
        limit,
    });
    const message = !access.hasActiveAccess
        ? "Showing previous day active signals only. Subscribe for today's live signals."
        : "Live active signals for your subscription plan.";
    return {
        access,
        signals,
        pagination,
        message,
    };
});
exports.getAppSignals = getAppSignals;
