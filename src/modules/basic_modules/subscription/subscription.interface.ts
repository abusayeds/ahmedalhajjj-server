import mongoose from "mongoose";

export interface ISubscription {
  _id?: string;
  name: "VIP" | "Forex" | "Crypto" | string;
  description: string;
  price: number;
  monthly?: string;
  yearly?: string;
  yearlyEnabled?: boolean;
  billingCycle?: "monthly" | "yearly";
  features: string[];
  maxSignalsPerDay?: number;
  includesGoldSignals?: boolean;
  includesTechnicalAnalysis?: boolean;
  includesMarketSentiment?: boolean;
  includesEconomicCalendar?: boolean;
  support?: "advanced" | "premium" | "basic" | string;
  signalTypes?: string[];
  allowedCategories?: string[];
  stripePriceId?: string;
  stripeProductId?: string;
  isActive: boolean;
  emoji?: string;
  color?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPlanSnapshot {
  planName: string;
  subscriptionId: string;
  maxSignalsPerDay: number;
  signalTypes: string[];
  allowedCategories: string[];
  includesGoldSignals: boolean;
  includesTechnicalAnalysis: boolean;
  includesMarketSentiment: boolean;
  includesEconomicCalendar: boolean;
  support: string;
  features: string[];
  yearlyEnabled: boolean;
  priceAtPurchase: number;
  billingCycle: "monthly" | "yearly";
  capturedAt: Date;
}

export interface IPurchase {
  _id?: string;
  userId: mongoose.Types.ObjectId | string;
  subscriptionId: mongoose.Types.ObjectId | string;
  subscriptionName: "VIP" | "Forex" | "Crypto" | string;
  planSnapshot?: IPlanSnapshot;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  startDate: Date;
  endDate: Date;
  isFreeTrial: boolean;
  freeTrialEndDate?: Date;
  paymentStatus: "pending" | "completed" | "failed" | "cancelled";
  amount: number;
  billingCycle: "monthly" | "yearly";
  autoRenew: boolean;
  cancelledAt?: Date;
  renewalAttempts: number;
  isActive: boolean;
  verificationOrder?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserSubscription {
  currentSubscription?: string;
  subscriptionType?: "VIP" | "Forex" | "Crypto" | null;
  subscriptionStatus: "active" | "trial" | "expired" | "cancelled" | "none";
  subscriptionEndDate?: Date;
  freeTrialEndDate?: Date;
  hasUsedFreeAccess: boolean;
}

export interface ITrialConfig {
  _id?: string;
  promoOn: boolean;
  promoLimit: number;
  promoDuration: string;
  trialOn: boolean;
  trialDuration: string;
  verifiedUserCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}
