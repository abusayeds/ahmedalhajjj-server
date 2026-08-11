import { SubscriptionModel, PurchaseModel, TrialConfigModel } from "./subscription.model";
import { ISubscription, IPurchase, ITrialConfig } from "./subscription.interface";
import { UserModel } from "../user/user.model";
import { validateAndApplyCoupon } from "../coupon/coupon.service";
import { createCheckoutSession } from "../../payment/stripe.service";
import AppError from "../../../errors/AppError";
import httpStatus from "http-status";

// Subscription Services
export const getAllSubscriptions = async (includeDisabled: boolean = false) => {
  if (includeDisabled) {
    return await SubscriptionModel.find({});
  }
  return await SubscriptionModel.find({ isActive: { $ne: false } });
};

export const getSubscriptionById = async (id: string) => {
  return await SubscriptionModel.findById(id);
};

export const createSubscriptionPlan = async (data: Partial<ISubscription>) => {
  const subscription = new SubscriptionModel(data);
  return await subscription.save();
};

export const updateSubscriptionPlan = async (
  id: string,
  data: Partial<ISubscription>
) => {
  return await SubscriptionModel.findByIdAndUpdate(id, data, { new: true });
};

export const deleteSubscriptionPlan = async (id: string) => {
  return await SubscriptionModel.findByIdAndDelete(id);
};

// Trial & Promo Configuration Services
export const getTrialConfig = async () => {
  let config = await TrialConfigModel.findOne({});
  if (!config) {
    config = await TrialConfigModel.create({
      promoOn: true,
      promoLimit: 100,
      promoDuration: "1 Month (30 Days)",
      trialOn: true,
      trialDuration: "2 Days",
    });
  }

  const claimedCount = await UserModel.countDocuments({
    role: "user",
    isDeleted: false,
    promoAccessUsed: true,
  });

  const subscriptionStats = await getSubscriptionStats();

  return {
    ...config.toObject(),
    claimedCount,
    subscriptionStats,
  };
};

export const getSubscriptionStats = async () => {
  const baseFilter = {
    role: "user",
    isDeleted: false,
    status: { $ne: "blocked" },
    subscriptionStatus: { $in: ["active", "trial"] },
  };

  const [vip, forex, crypto, total] = await Promise.all([
    UserModel.countDocuments({ ...baseFilter, subscriptionType: "VIP" }),
    UserModel.countDocuments({ ...baseFilter, subscriptionType: "Forex" }),
    UserModel.countDocuments({ ...baseFilter, subscriptionType: "Crypto" }),
    UserModel.countDocuments({ role: "user", isDeleted: false }),
  ]);

  return { vip, forex, crypto, total };
};

export const updateTrialConfig = async (data: Partial<ITrialConfig>) => {
  let config = await TrialConfigModel.findOne({});
  if (!config) {
    config = new TrialConfigModel(data);
  } else {
    Object.assign(config, data);
  }
  return await config.save();
};

// Purchase Services
export const getUserPurchases = async (userId: string) => {
  return await PurchaseModel.find({ userId }).populate("subscriptionId");
};

export const getUserActiveSubscription = async (userId: string) => {
  return await PurchaseModel.findOne({
    userId,
    isActive: true,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
  }).populate("subscriptionId");
};

export const createPurchase = async (purchaseData: Partial<IPurchase>) => {
  const purchase = new PurchaseModel(purchaseData);
  return await purchase.save();
};

export const updatePurchaseStatus = async (
  purchaseId: string,
  status: "pending" | "completed" | "failed" | "cancelled"
) => {
  return await PurchaseModel.findByIdAndUpdate(
    purchaseId,
    { paymentStatus: status },
    { new: true }
  );
};

export const cancelPurchase = async (purchaseId: string) => {
  return await PurchaseModel.findByIdAndUpdate(
    purchaseId,
    { isActive: false, cancelledAt: new Date() },
    { new: true }
  );
};

export const getUserTrialStatus = async (userId: string) => {
  const eligibility = await getFreeTrialEligibility(userId);
  const purchase = await PurchaseModel.findOne({
    userId,
    isFreeTrial: true,
    paymentStatus: "completed",
  }).sort({ createdAt: -1 });

  if (!purchase) {
    return {
      hasUsedFreeTrial: eligibility.hasUsedFreeTrial,
      canStartFreeTrial: eligibility.canStart,
      reason: eligibility.reason,
    };
  }

  const now = new Date();
  const trialEnded = purchase.freeTrialEndDate && purchase.freeTrialEndDate < now;

  return {
    hasUsedFreeTrial: true,
    isTrialActive: !trialEnded,
    trialEndDate: purchase.freeTrialEndDate,
    canStartFreeTrial: eligibility.canStart,
    reason: eligibility.reason,
  };
};

export const getFreeTrialEligibility = async (userId: string) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found.");
  }

  const config = await getTrialConfig();
  const trialPurchase = await PurchaseModel.findOne({
    userId,
    isFreeTrial: true,
    paymentStatus: "completed",
  });

  const hasUsedFreeTrial = Boolean(trialPurchase);

  const activePaidPurchase = await PurchaseModel.findOne({
    userId,
    isFreeTrial: false,
    paymentStatus: "completed",
    isActive: true,
    endDate: { $gte: new Date() },
  });

  const hasActivePaidSubscription =
    Boolean(activePaidPurchase) ||
    (user.subscriptionStatus === "active" &&
      Boolean(user.subscriptionEndDate) &&
      new Date(user.subscriptionEndDate) >= new Date());

  if (hasUsedFreeTrial) {
    return {
      canStart: false,
      reason: "You have already used your free trial on this account.",
      hasUsedFreeTrial: true,
      hasActivePaidSubscription,
      hasUsedFreeAccess: user.hasUsedFreeAccess,
    };
  }

  if (hasActivePaidSubscription) {
    return {
      canStart: false,
      reason:
        "You already have an active paid subscription. Free trial is available only before your first paid plan or after it expires.",
      hasUsedFreeTrial: false,
      hasActivePaidSubscription: true,
      hasUsedFreeAccess: user.hasUsedFreeAccess,
    };
  }

  const promoAvailable =
    config.promoOn && (config.claimedCount || 0) < (config.promoLimit || 0);

  if (!config.trialOn && !promoAvailable) {
    return {
      canStart: false,
      reason: "Free trial is currently unavailable.",
      hasUsedFreeTrial: false,
      hasActivePaidSubscription: false,
      hasUsedFreeAccess: user.hasUsedFreeAccess,
    };
  }

  return {
    canStart: true,
    reason: null,
    hasUsedFreeTrial: false,
    hasActivePaidSubscription: false,
    hasUsedFreeAccess: user.hasUsedFreeAccess,
    promoAvailable,
    trialOn: config.trialOn,
  };
};

const calculateDiscountedAmount = (price: number, coupon: any) => {
  if (!coupon) return price;

  if (coupon.discountType === "fixed") {
    return Math.max(0, price - Number(coupon.discount));
  }

  return Math.max(0, price * (1 - Number(coupon.discount) / 100));
};

const parseDurationDays = (duration: string): number => {
  const lower = duration.toLowerCase();
  const monthMatch = lower.match(/(\d+)\s*month/);
  if (monthMatch) return parseInt(monthMatch[1], 10) * 30;
  const dayMatch = lower.match(/(\d+)\s*day/);
  if (dayMatch) return parseInt(dayMatch[1], 10);
  return 2;
};

const resolveTrialAccess = async (userId: string) => {
  const config = await getTrialConfig();
  const eligibility = await getFreeTrialEligibility(userId);

  if (!eligibility.canStart) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      eligibility.reason || "Free trial is not available for this account.",
    );
  }

  const promoClaimedCount = await UserModel.countDocuments({
    role: "user",
    isDeleted: false,
    promoAccessUsed: true,
  });

  if (config.promoOn && promoClaimedCount < config.promoLimit) {
    return {
      days: parseDurationDays(config.promoDuration),
      isPromo: true,
      accessLabel: "promo",
    };
  }

  if (!config.trialOn) {
    throw new AppError(httpStatus.BAD_REQUEST, "Free trial is currently unavailable.");
  }

  return {
    days: parseDurationDays(config.trialDuration),
    isPromo: false,
    accessLabel: "trial",
  };
};

export const initiateSubscriptionPurchase = async (
  userId: string,
  subscriptionId: string,
  options: {
    isFreeTrial?: boolean;
    couponCode?: string;
    billingCycle?: "monthly" | "yearly";
  } = {},
) => {
  const normalizedUserId = String(userId);
  const normalizedSubscriptionId = String(subscriptionId);

  const subscription = await SubscriptionModel.findById(normalizedSubscriptionId);
  if (!subscription || subscription.isActive === false) {
    throw new AppError(httpStatus.NOT_FOUND, "Subscription plan not found or inactive.");
  }

  let coupon = null;
  if (options.couponCode) {
    try {
      coupon = await validateAndApplyCoupon(options.couponCode);
      if (
        coupon.applicablePlans &&
        coupon.applicablePlans.length > 0 &&
        !coupon.applicablePlans.includes(subscription.name)
      ) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `Coupon is not applicable to ${subscription.name} plan.`,
        );
      }
    } catch (error: any) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        error.message || "Invalid coupon code.",
      );
    }
  }

  const subscriptionName = subscription.name;
  const billingCycle = options.billingCycle || "monthly";

  if (billingCycle === "yearly" && subscription.yearlyEnabled === false) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Yearly billing is not available for this subscription plan.",
    );
  }

  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 1);

  if (options.isFreeTrial) {
    const trialAccess = await resolveTrialAccess(normalizedUserId);
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + trialAccess.days);

    await PurchaseModel.updateMany(
      { userId: normalizedUserId, isActive: true },
      { $set: { isActive: false } },
    );

    const purchase = await PurchaseModel.create({
      userId: normalizedUserId,
      subscriptionId: normalizedSubscriptionId,
      subscriptionName,
      isFreeTrial: true,
      paymentStatus: "completed",
      isActive: true,
      amount: 0,
      startDate: new Date(),
      endDate: trialEndDate,
      freeTrialEndDate: trialEndDate,
      billingCycle,
    });

    await UserModel.findByIdAndUpdate(normalizedUserId, {
      subscriptionType: subscriptionName,
      subscriptionStatus: "trial",
      subscriptionEndDate: trialEndDate,
      freeTrialEndDate: trialEndDate,
      hasUsedFreeAccess: true,
      promoAccessUsed: trialAccess.isPromo,
      currentSubscription: purchase._id,
    });

    return {
      purchase,
      checkoutUrl: null,
      sessionId: null,
      finalAmount: 0,
      couponApplied: null,
      paymentRequired: false,
      accessType: trialAccess.accessLabel,
      trialDays: trialAccess.days,
      nextStep: trialAccess.isPromo
        ? `Promo access activated for ${trialAccess.days} days.`
        : `Free trial activated for ${trialAccess.days} days.`,
    };
  }

  const finalAmount = calculateDiscountedAmount(subscription.price, coupon);

  if (finalAmount === 0) {
    await PurchaseModel.updateMany(
      { userId: normalizedUserId, isActive: true },
      { $set: { isActive: false } },
    );
  }

  const purchase = await PurchaseModel.create({
    userId: normalizedUserId,
    subscriptionId: normalizedSubscriptionId,
    subscriptionName,
    isFreeTrial: false,
    paymentStatus: finalAmount === 0 ? "completed" : "pending",
    isActive: finalAmount === 0,
    amount: finalAmount,
    startDate: new Date(),
    endDate,
    billingCycle,
  });

  if (finalAmount === 0) {
    await UserModel.findByIdAndUpdate(normalizedUserId, {
      subscriptionType: subscriptionName,
      subscriptionStatus: "active",
      subscriptionEndDate: endDate,
      currentSubscription: purchase._id,
    });

    if (coupon && options.couponCode) {
      coupon.used = (coupon.used || 0) + 1;
      if (coupon.used >= coupon.limit) {
        coupon.status = "Exhausted";
      }
      await coupon.save();
    }

    return {
      purchase,
      checkoutUrl: null,
      sessionId: null,
      finalAmount,
      couponApplied: coupon?.code || null,
      paymentRequired: false,
      nextStep: "Subscription activated immediately (100% coupon discount).",
    };
  }

  const session = await createCheckoutSession({
    userId: normalizedUserId,
    subscriptionId: normalizedSubscriptionId,
    subscriptionName,
    amount: finalAmount,
    purchaseId: String(purchase._id),
    couponCode: options.couponCode,
  });

  return {
    purchase,
    checkoutUrl: session.url,
    sessionId: session.id,
    finalAmount,
    couponApplied: coupon?.code || null,
    paymentRequired: true,
      nextStep:
      "Complete payment on Stripe checkout URL, then Stripe webhook will activate the subscription.",
  };
};
