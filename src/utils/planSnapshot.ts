import {
  IPlanSnapshot,
  ISubscription,
} from "../modules/basic_modules/subscription/subscription.interface";

export const SIGNAL_CATEGORIES = ["Forex", "Crypto", "Commodity", "Index"] as const;

export const getDefaultCategoriesForPlan = (planName: string): string[] => {
  const name = planName.toLowerCase();
  if (name.includes("forex")) return ["Forex", "Commodity"];
  if (name.includes("crypto")) return ["Crypto"];
  return ["Forex", "Crypto", "Commodity", "Index"];
};

export const buildPlanSnapshot = (
  subscription: ISubscription,
  billingCycle: "monthly" | "yearly" = "monthly",
): IPlanSnapshot => {
  const planName = subscription.name;

  return {
    planName,
    subscriptionId: String(subscription._id),
    maxSignalsPerDay: subscription.maxSignalsPerDay ?? (planName === "VIP" ? 10 : 5),
    signalTypes: subscription.signalTypes?.length ? [...subscription.signalTypes] : [],
    allowedCategories: subscription.allowedCategories?.length
      ? [...subscription.allowedCategories]
      : getDefaultCategoriesForPlan(planName),
    includesGoldSignals: subscription.includesGoldSignals ?? false,
    includesTechnicalAnalysis: subscription.includesTechnicalAnalysis ?? false,
    includesMarketSentiment: subscription.includesMarketSentiment ?? false,
    includesEconomicCalendar: subscription.includesEconomicCalendar ?? false,
    support: subscription.support || "basic",
    features: subscription.features?.length ? [...subscription.features] : [],
    yearlyEnabled: subscription.yearlyEnabled !== false,
    priceAtPurchase: subscription.price,
    billingCycle,
    capturedAt: new Date(),
  };
};
