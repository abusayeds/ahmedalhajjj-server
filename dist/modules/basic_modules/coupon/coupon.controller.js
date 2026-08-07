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
exports.validateCoupon = exports.deleteCoupon = exports.updateCoupon = exports.createCoupon = exports.getCouponDetail = exports.getCoupons = void 0;
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse"));
const coupon_service_1 = require("./coupon.service");
exports.getCoupons = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const coupons = yield (0, coupon_service_1.getAllCoupons)();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Coupons retrieved successfully",
        data: coupons,
    });
}));
exports.getCouponDetail = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const coupon = yield (0, coupon_service_1.getCouponById)(id);
    if (!coupon) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 404,
            success: false,
            message: "Coupon not found",
            data: null,
        });
    }
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Coupon retrieved successfully",
        data: coupon,
    });
}));
exports.createCoupon = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const coupon = yield (0, coupon_service_1.createCoupon)(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "Coupon created successfully",
        data: coupon,
    });
}));
exports.updateCoupon = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const coupon = yield (0, coupon_service_1.updateCoupon)(id, req.body);
    if (!coupon) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 404,
            success: false,
            message: "Coupon not found",
            data: null,
        });
    }
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Coupon updated successfully",
        data: coupon,
    });
}));
exports.deleteCoupon = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const coupon = yield (0, coupon_service_1.deleteCoupon)(id);
    if (!coupon) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 404,
            success: false,
            message: "Coupon not found",
            data: null,
        });
    }
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Coupon deleted successfully",
        data: coupon,
    });
}));
exports.validateCoupon = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code } = req.body;
    if (!code) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 400,
            success: false,
            message: "Coupon code is required",
            data: null,
        });
    }
    try {
        const coupon = yield (0, coupon_service_1.validateAndApplyCoupon)(code);
        (0, sendResponse_1.default)(res, {
            statusCode: 200,
            success: true,
            message: "Coupon is valid",
            data: coupon,
        });
    }
    catch (err) {
        (0, sendResponse_1.default)(res, {
            statusCode: 400,
            success: false,
            message: err.message || "Invalid coupon",
            data: null,
        });
    }
}));
