import { CouponModel } from "./coupon.model";
import { ICoupon } from "./coupon.interface";

export const getAllCoupons = async () => {
  const count = await CouponModel.countDocuments({});
  if (count === 0) {
    // Seed initial database records if DB is empty
    await CouponModel.create([
      { code: "ELITE50", discount: 50, discountType: "percentage", limit: 100, used: 67, status: "Active", expiry: "Jul 31, 2026" },
      { code: "VIPFREE", discount: 100, discountType: "percentage", limit: 10, used: 10, status: "Exhausted", expiry: "Jul 25, 2026" },
      { code: "FOREX20", discount: 20, discountType: "percentage", limit: 200, used: 43, status: "Active", expiry: "Aug 15, 2026" },
      { code: "CRYPTO30", discount: 30, discountType: "percentage", limit: 50, used: 12, status: "Active", expiry: "Aug 01, 2026" },
    ]);
  }
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
