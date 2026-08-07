import bcrypt from "bcrypt";
import mongoose, { Schema } from "mongoose";
import { IOTP, IUser } from "./user.interface";

const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, trim: true, required: false },
    lastName: { type: String, trim: true, required: false },
    email: { type: String, required: false, unique: true, trim: true },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 3,
      set: (v: string) => bcrypt.hashSync(v, bcrypt.genSaltSync(Number(12))),
      select: 0,
    },
    phone: { type: String, trim: true, required: false },
    address: { type: String, required: false, trim: true },
    image: {
      type: {
        publicFileURL: { type: String, trim: true },
        path: { type: String, trim: true },
      },
      required: false,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isVerify: {
      type: Boolean,
      default: false,
    },
    currentSubscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase",
      default: null,
    },
    subscriptionType: {
      type: String,
      enum: ["VIP", "Forex", "Crypto", null],
      default: null,
    },
    subscriptionStatus: {
      type: String,
      enum: ["active", "trial", "expired", "cancelled", "none"],
      default: "none",
    },
    subscriptionEndDate: { type: Date },
    freeTrialEndDate: { type: Date },
    hasUsedFreeAccess: { type: Boolean, default: false },
  },
  { timestamps: true }
);

UserSchema.pre("save", function (next) {
  if ((this.firstName || this.lastName) && !this.name) {
    this.name = `${this.firstName || ""} ${this.lastName || ""}`.trim();
  }
  next();
});

export const UserModel =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

const OTPSchema = new Schema<IOTP>({
  email: { type: String, required: true, trim: true },
  otp: { type: String, required: true, trim: true },
  expiresAt: { type: Date, required: true },
});

export const OTPModel = mongoose.model<IOTP>("OTP", OTPSchema);
