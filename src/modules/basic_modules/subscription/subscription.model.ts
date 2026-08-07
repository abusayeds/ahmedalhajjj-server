import mongoose, { Schema } from "mongoose";
import { ISubscription, IPurchase, ITrialConfig } from "./subscription.interface";

const SubscriptionSchema = new Schema<ISubscription>(
  {
    name: {
      type: String,
      required: true,
    },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    monthly: { type: String },
    yearly: { type: String },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
    },
    features: [{ type: String }],
    maxSignalsPerDay: { type: Number, default: 10 },
    includesGoldSignals: { type: Boolean, default: false },
    includesTechnicalAnalysis: { type: Boolean, default: false },
    includesMarketSentiment: { type: Boolean, default: false },
    includesEconomicCalendar: { type: Boolean, default: false },
    support: {
      type: String,
      default: "basic",
    },
    signalTypes: [{ type: String }],
    stripePriceId: { type: String },
    stripeProductId: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const PurchaseSchema = new Schema<IPurchase>(
  {
    userId: {
      type: "ObjectId" as any,
      ref: "User",
      required: true,
    },
    subscriptionId: {
      type: "ObjectId" as any,
      ref: "Subscription",
      required: true,
    },
    subscriptionName: {
      type: String,
      required: true,
    },
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String },
    startDate: { type: Date, required: true, default: Date.now },
    endDate: { type: Date, required: true },
    isFreeTrial: { type: Boolean, default: false },
    freeTrialEndDate: { type: Date },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "pending",
    },
    amount: { type: Number, required: true },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
    },
    autoRenew: { type: Boolean, default: true },
    cancelledAt: { type: Date },
    renewalAttempts: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  } as any,
  { timestamps: true }
);

const TrialConfigSchema = new Schema<ITrialConfig>(
  {
    promoOn: { type: Boolean, default: true },
    promoLimit: { type: Number, default: 100 },
    promoDuration: { type: String, default: "1 Month (30 Days)" },
    trialOn: { type: Boolean, default: true },
    trialDuration: { type: String, default: "2 Days" },
  },
  { timestamps: true }
);

export const SubscriptionModel =
  mongoose.models.Subscription ||
  mongoose.model<ISubscription>("Subscription", SubscriptionSchema);

export const PurchaseModel =
  mongoose.models.Purchase ||
  mongoose.model<IPurchase>("Purchase", PurchaseSchema);

export const TrialConfigModel =
  mongoose.models.TrialConfig ||
  mongoose.model<ITrialConfig>("TrialConfig", TrialConfigSchema);
