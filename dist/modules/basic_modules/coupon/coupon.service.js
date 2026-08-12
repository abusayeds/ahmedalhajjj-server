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
exports.validateAndApplyCoupon = exports.deleteCoupon = exports.updateCoupon = exports.createCoupon = exports.getCouponByCode = exports.getCouponById = exports.getAllCoupons = void 0;
const coupon_model_1 = require("./coupon.model");
const getAllCoupons = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield coupon_model_1.CouponModel.find({}).sort({ createdAt: -1 });
});
exports.getAllCoupons = getAllCoupons;
const getCouponById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield coupon_model_1.CouponModel.findById(id);
});
exports.getCouponById = getCouponById;
const getCouponByCode = (code) => __awaiter(void 0, void 0, void 0, function* () {
    return yield coupon_model_1.CouponModel.findOne({ code: code.toUpperCase().trim() });
});
exports.getCouponByCode = getCouponByCode;
const createCoupon = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const code = (data.code || "").toUpperCase().trim();
    const coupon = new coupon_model_1.CouponModel(Object.assign(Object.assign({}, data), { code }));
    return yield coupon.save();
});
exports.createCoupon = createCoupon;
const updateCoupon = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    if (data.code) {
        data.code = data.code.toUpperCase().trim();
    }
    return yield coupon_model_1.CouponModel.findByIdAndUpdate(id, data, { new: true });
});
exports.updateCoupon = updateCoupon;
const deleteCoupon = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield coupon_model_1.CouponModel.findByIdAndDelete(id);
});
exports.deleteCoupon = deleteCoupon;
const validateAndApplyCoupon = (code) => __awaiter(void 0, void 0, void 0, function* () {
    const coupon = yield coupon_model_1.CouponModel.findOne({ code: code.toUpperCase().trim() });
    if (!coupon) {
        throw new Error("Invalid coupon code");
    }
    if (coupon.status !== "Active") {
        throw new Error(`Coupon is ${coupon.status.toLowerCase()}`);
    }
    if (coupon.used >= coupon.limit) {
        coupon.status = "Exhausted";
        yield coupon.save();
        throw new Error("Coupon usage limit reached");
    }
    if (coupon.expiryDate && coupon.expiryDate < new Date()) {
        coupon.status = "Expired";
        yield coupon.save();
        throw new Error("Coupon has expired");
    }
    return coupon;
});
exports.validateAndApplyCoupon = validateAndApplyCoupon;
