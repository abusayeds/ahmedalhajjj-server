import { CouponModel } from "./coupon.model";
import { ICoupon } from "./coupon.interface";

export const getAllCoupons = async () => {
  return await CouponModel.find({}).sort({ createdAt: -1 });
};

export const getCouponById = async (id: string) => {
  return await CouponModel.findById(id);
};

export const getCouponByCode = async (code: string) => {
  return await CouponModel.findOne({ code: code.toUpperCase().trim() });
};

export const createCoupon = async (data: Partial<ICoupon>) => {
  const code = (data.code || "").toUpperCase().trim();
  const coupon = new CouponModel({ ...data, code });
  return await coupon.save();
};

export const updateCoupon = async (id: string, data: Partial<ICoupon>) => {
  if (data.code) {
    data.code = data.code.toUpperCase().trim();
  }
  return await CouponModel.findByIdAndUpdate(id, data, { new: true });
};

export const deleteCoupon = async (id: string) => {
  return await CouponModel.findByIdAndDelete(id);
};

export const validateAndApplyCoupon = async (code: string) => {
  const coupon = await CouponModel.findOne({ code: code.toUpperCase().trim() });
  if (!coupon) {
    throw new Error("Invalid coupon code");
  }

  if (coupon.status !== "Active") {
    throw new Error(`Coupon is ${coupon.status.toLowerCase()}`);
  }

  if (coupon.used >= coupon.limit) {
    coupon.status = "Exhausted";
    await coupon.save();
    throw new Error("Coupon usage limit reached");
  }

  if (coupon.expiryDate && coupon.expiryDate < new Date()) {
    coupon.status = "Expired";
    await coupon.save();
    throw new Error("Coupon has expired");
  }

  return coupon;
};
