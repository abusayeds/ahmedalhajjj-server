import { IUser } from "../modules/basic_modules/user/user.interface";
import { PurchaseModel } from "../modules/basic_modules/subscription/subscription.model";
import {
  IPurchase,
  IPlanSnapshot,
} from "../modules/basic_modules/subscription/subscription.interface";
import { getDefaultCategoriesForPlan } from "./planSnapshot";

export type AccessPlan = "VIP" | "Forex" | "Crypto" | null;

const DEFAULT_SIGNAL_TYPES: Record<Exclude<AccessPlan, null>, string[]> = {
  VIP: ["Scalp", "Swing", "Intraday", "Position", "Long-term"],
  Forex: ["Scalp", "Swing"],
  Crypto: ["Scalp", "Swing"],
};

export interface UserAccessContext {
  plan: AccessPlan;
  hasActiveAccess: boolean;
  canViewTodaySignals: boolean;
  canViewPremiumContent: boolean;
  maxSignalsPerDay: number;
  allowedCategories: string[];
  allowedSignalTypes: string[];
  accessType: "none" | "trial" | "promo" | "paid";
  includesGoldSignals?: boolean;
  includesTechnicalAnalysis?: boolean;
  includesMarketSentiment?: boolean;
  includesEconomicCalendar?: boolean;
  support?: string;
}

const NO_ACCESS: UserAccessContext = {
  plan: null,
  hasActiveAccess: false,
  canViewTodaySignals: false,
  canViewPremiumContent: false,
  maxSignalsPerDay: 0,
  allowedCategories: [],
  allowedSignalTypes: [],
  accessType: "none",
};

const resolvePlanFromName = (name?: string): AccessPlan => {
  const value = (name || "").toLowerCase();
  if (value.includes("forex")) return "Forex";
  if (value.includes("crypto")) return "Crypto";
  if (value.includes("vip")) return "VIP";
  return null;
};

const isPurchaseCurrentlyActive = (purchase: IPurchase, now = new Date()): boolean => {
  if (!purchase.isActive || purchase.paymentStatus !== "completed") {
    return false;
  }

  if (purchase.startDate && new Date(purchase.startDate) > now) {
    return false;
  }

  if (purchase.endDate && new Date(purchase.endDate) < now) {
    return false;
  }

  return true;
};

const findActivePurchase = async (user: IUser): Promise<IPurchase | null> => {
  const now = new Date();
  const userId = String(user._id);

  if (user.currentSubscription) {
    const linked = await PurchaseModel.findById(user.currentSubscription);
    if (
      linked &&
      String(linked.userId) === userId &&
      isPurchaseCurrentlyActive(linked, now)
    ) {
      return linked;
    }
  }

  return PurchaseModel.findOne({
    userId,
    isActive: true,
    paymentStatus: "completed",
    startDate: { $lte: now },
    endDate: { $gte: now },
  }).sort({ createdAt: -1 });
};

const resolveAccessType = (
  user: IUser,
  purchase: IPurchase,
): UserAccessContext["accessType"] => {
  if (purchase.isFreeTrial) {
    return user.promoAccessUsed ? "promo" : "trial";
  }
  return "paid";
};

const buildAccessFromSnapshot = (
  user: IUser,
  purchase: IPurchase,
  snapshot: IPlanSnapshot,
  plan: AccessPlan,
): UserAccessContext => {
  return {
    plan,
    hasActiveAccess: true,
    canViewTodaySignals: true,
    canViewPremiumContent: true,
    maxSignalsPerDay: snapshot.maxSignalsPerDay,
    allowedCategories: snapshot.allowedCategories?.length
      ? snapshot.allowedCategories
      : getDefaultCategoriesForPlan(snapshot.planName),
    allowedSignalTypes: snapshot.signalTypes?.length
      ? snapshot.signalTypes
      : plan
        ? DEFAULT_SIGNAL_TYPES[plan]
        : [],
    accessType: resolveAccessType(user, purchase),
    includesGoldSignals: snapshot.includesGoldSignals,
    includesTechnicalAnalysis: snapshot.includesTechnicalAnalysis,
    includesMarketSentiment: snapshot.includesMarketSentiment,
    includesEconomicCalendar: snapshot.includesEconomicCalendar,
    support: snapshot.support,
  };
};

const buildLegacyAccessFromPurchase = (
  user: IUser,
  purchase: IPurchase,
  plan: AccessPlan,
): UserAccessContext => {
  const planName = purchase.subscriptionName || plan || "";

  return {
    plan,
    hasActiveAccess: true,
    canViewTodaySignals: true,
    canViewPremiumContent: true,
    maxSignalsPerDay: plan === "VIP" ? 10 : 5,
    allowedCategories: getDefaultCategoriesForPlan(planName),
    allowedSignalTypes: plan ? DEFAULT_SIGNAL_TYPES[plan] : [],
    accessType: resolveAccessType(user, purchase),
  };
};

export const resolveUserAccess = async (user: IUser): Promise<UserAccessContext> => {
  const purchase = await findActivePurchase(user);

  if (!purchase) {
    return NO_ACCESS;
  }

  const planName = purchase.planSnapshot?.planName || purchase.subscriptionName;
  const plan = resolvePlanFromName(planName);

  if (!plan) {
    return NO_ACCESS;
  }

  if (purchase.planSnapshot) {
    return buildAccessFromSnapshot(user, purchase, purchase.planSnapshot, plan);
  }

  return buildLegacyAccessFromPurchase(user, purchase, plan);
};

export const getYesterdayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 1);

  const end = new Date(start);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

export const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return { start, end };
};
