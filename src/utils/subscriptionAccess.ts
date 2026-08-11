import { IUser } from "../modules/basic_modules/user/user.interface";
import { SubscriptionModel } from "../modules/basic_modules/subscription/subscription.model";

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
}

const isAccessActive = (user: IUser): boolean => {
  if (!user) return false;
  if (user.subscriptionStatus === "none" || user.subscriptionStatus === "expired" || user.subscriptionStatus === "cancelled") {
    return false;
  }
  if (user.subscriptionEndDate && new Date(user.subscriptionEndDate) < new Date()) {
    return false;
  }
  return user.subscriptionStatus === "active" || user.subscriptionStatus === "trial";
};

export const resolveUserAccess = async (user: IUser): Promise<UserAccessContext> => {
  const active = isAccessActive(user);
  const plan = (user.subscriptionType as AccessPlan) || null;

  if (!active || !plan) {
    return {
      plan: null,
      hasActiveAccess: false,
      canViewTodaySignals: false,
      canViewPremiumContent: false,
      maxSignalsPerDay: 0,
      allowedCategories: [],
      allowedSignalTypes: [],
      accessType: "none",
    };
  }

  const subscription = await SubscriptionModel.findOne({ name: plan, isActive: { $ne: false } });

  const maxSignalsPerDay = subscription?.maxSignalsPerDay || (plan === "VIP" ? 10 : 5);
  const allowedSignalTypes = subscription?.signalTypes?.length
    ? subscription.signalTypes
    : DEFAULT_SIGNAL_TYPES[plan];

  let allowedCategories: string[] = [];
  if (plan === "VIP") {
    allowedCategories = ["Forex", "Crypto", "Commodity", "Index"];
  } else if (plan === "Forex") {
    allowedCategories = ["Forex", "Commodity"];
  } else if (plan === "Crypto") {
    allowedCategories = ["Crypto"];
  }

  const accessType =
    user.subscriptionStatus === "trial"
      ? user.promoAccessUsed
        ? "promo"
        : "trial"
      : "paid";

  return {
    plan,
    hasActiveAccess: true,
    canViewTodaySignals: true,
    canViewPremiumContent: true,
    maxSignalsPerDay,
    allowedCategories,
    allowedSignalTypes,
    accessType,
  };
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
