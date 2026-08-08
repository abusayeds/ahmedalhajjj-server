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
exports.buildSignalTypeMatchFilter = exports.assertActiveSignalType = exports.deleteSignalType = exports.updateSignalType = exports.createSignalType = exports.getActiveSignalTypeNames = exports.getSignalTypes = exports.normalizeSignalTypeName = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const signalType_model_1 = require("./signalType.model");
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const normalizeSignalTypeName = (value) => {
    const trimmed = value.trim();
    if (!trimmed)
        return "";
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};
exports.normalizeSignalTypeName = normalizeSignalTypeName;
const getSignalTypes = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (includeInactive = false) {
    const filter = includeInactive ? {} : { isActive: true };
    return signalType_model_1.SignalTypeModel.find(filter).sort({ name: 1 });
});
exports.getSignalTypes = getSignalTypes;
const getActiveSignalTypeNames = () => __awaiter(void 0, void 0, void 0, function* () {
    const types = yield signalType_model_1.SignalTypeModel.find({ isActive: true }).sort({ name: 1 });
    return types.map((type) => type.name);
});
exports.getActiveSignalTypeNames = getActiveSignalTypeNames;
const createSignalType = (name) => __awaiter(void 0, void 0, void 0, function* () {
    const normalized = (0, exports.normalizeSignalTypeName)(name);
    if (!normalized) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Signal type name is required.");
    }
    const existing = yield signalType_model_1.SignalTypeModel.findOne({
        name: { $regex: `^${escapeRegex(normalized)}$`, $options: "i" },
    });
    if (existing) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "This signal type already exists.");
    }
    return signalType_model_1.SignalTypeModel.create({ name: normalized, isActive: true });
});
exports.createSignalType = createSignalType;
const updateSignalType = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const data = Object.assign({}, payload);
    if (payload.name) {
        const normalized = (0, exports.normalizeSignalTypeName)(payload.name);
        if (!normalized) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Signal type name is required.");
        }
        const duplicate = yield signalType_model_1.SignalTypeModel.findOne({
            _id: { $ne: id },
            name: { $regex: `^${escapeRegex(normalized)}$`, $options: "i" },
        });
        if (duplicate) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "This signal type already exists.");
        }
        data.name = normalized;
    }
    const updated = yield signalType_model_1.SignalTypeModel.findByIdAndUpdate(id, data, { new: true });
    if (!updated) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Signal type not found.");
    }
    return updated;
});
exports.updateSignalType = updateSignalType;
const deleteSignalType = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const deleted = yield signalType_model_1.SignalTypeModel.findByIdAndDelete(id);
    if (!deleted) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Signal type not found.");
    }
    return deleted;
});
exports.deleteSignalType = deleteSignalType;
const assertActiveSignalType = (type) => __awaiter(void 0, void 0, void 0, function* () {
    const normalized = (0, exports.normalizeSignalTypeName)(type);
    if (!normalized) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Signal type is required.");
    }
    const exists = yield signalType_model_1.SignalTypeModel.findOne({
        name: { $regex: `^${escapeRegex(normalized)}$`, $options: "i" },
        isActive: true,
    });
    if (!exists) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Invalid signal type. Choose a type from the admin list.");
    }
    return exists.name;
});
exports.assertActiveSignalType = assertActiveSignalType;
const buildSignalTypeMatchFilter = (allowedSignalTypes) => {
    const normalized = allowedSignalTypes
        .map((type) => (0, exports.normalizeSignalTypeName)(type))
        .filter(Boolean);
    if (!normalized.length) {
        return { type: { $in: [] } };
    }
    return {
        $or: normalized.map((type) => ({
            type: { $regex: `^${escapeRegex(type)}$`, $options: "i" },
        })),
    };
};
exports.buildSignalTypeMatchFilter = buildSignalTypeMatchFilter;
