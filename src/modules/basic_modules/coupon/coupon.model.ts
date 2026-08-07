import mongoose, { Schema } from "mongoose";
import { ICoupon } from "./coupon.interface";

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discount: { type: Schema.Types.Mixed, required: true },
    discountType: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
    expiry: { type: String },
    expiryDate: { type: Date },
    limit: { type: Number, default: 100 },
    used: { type: Number, default: 0 },
    usedCount: { type: Number, default: 0 },
    status: { type: String, enum: ["Active", "Inactive", "Exhausted", "Expired"], default: "Active" },
    applicablePlans: [{ type: String }],
  },
  { timestamps: true }
);

export const CouponModel =
  mongoose.models.Coupon || mongoose.model<ICoupon>("Coupon", CouponSchema);
