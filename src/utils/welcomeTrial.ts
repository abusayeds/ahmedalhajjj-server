import { UserModel } from "../modules/basic_modules/user/user.model";
import { PurchaseModel } from "../modules/basic_modules/subscription/subscription.model";
import { TrialConfigModel } from "../modules/basic_modules/subscription/subscription.model";
import { ITrialConfig } from "../modules/basic_modules/subscription/subscription.interface";

const DEFAULT_TRIAL_CONFIG = {
  promoOn: true,
  promoLimit: 100,
  promoDuration: "1 Month (30 Days)",
  trialOn: true,
  trialDuration: "2 Days",
  verifiedUserCount: 0,
};

export const parseTrialDurationDays = (duration: string): number => {
  const lower = duration.toLowerCase();
  const monthMatch = lower.match(/(\d+)\s*month/);
  if (monthMatch) return parseInt(monthMatch[1], 10) * 30;
  const dayMatch = lower.match(/(\d+)\s*day/);
  if (dayMatch) return parseInt(dayMatch[1], 10);
  return 2;
};

export const getOrCreateTrialConfig = async (): Promise<ITrialConfig> => {
  let config = await TrialConfigModel.findOne({}).lean<ITrialConfig>();
  if (!config) {
    const created = await TrialConfigModel.create(DEFAULT_TRIAL_CONFIG);
    config = created.toObject() as ITrialConfig;
  }
  return config;
};

export const syncVerifiedUserCountIfNeeded = async (config: ITrialConfig) => {
  if ((config.verifiedUserCount || 0) > 0) {
    return config;
  }

  const verifiedUserCount = await UserModel.countDocuments({
    role: "user",
    isDeleted: false,
    isVerify: true,
  });

  if (verifiedUserCount > 0) {
    await TrialConfigModel.findByIdAndUpdate(config._id, { verifiedUserCount });
    return { ...config, verifiedUserCount };
  }

  return config;
};

export const assignVerificationOrderOnVerify = async (): Promise<number> => {
  const config = await TrialConfigModel.findOneAndUpdate(
    {},
    {
      $inc: { verifiedUserCount: 1 },
      $setOnInsert: DEFAULT_TRIAL_CONFIG,
    },
    { new: true, upsert: true },
  );

  return config?.verifiedUserCount || 1;
};

export const getPromoClaimedCount = (config: ITrialConfig): number => {
  const promoLimit = config.promoLimit || 100;
  return Math.min(config.verifiedUserCount || 0, promoLimit);
};

export const getVerificationOrderFromPurchase = async (userId: string): Promise<number> => {
  const purchase = await PurchaseModel.findOne({
    userId,
    verificationOrder: { $exists: true, $gt: 0 },
  })
    .sort({ createdAt: -1 })
    .select("verificationOrder");

  if (purchase?.verificationOrder) {
    return purchase.verificationOrder;
  }

  return 0;
};

export const resolveVerificationOrderForUser = async (userId: string): Promise<number> => {
  const fromPurchase = await getVerificationOrderFromPurchase(userId);
  if (fromPurchase > 0) {
    return fromPurchase;
  }

  const user = await UserModel.findById(userId).select(
    "isVerify role isDeleted verificationOrder createdAt",
  );

  if (!user || user.role !== "user" || user.isDeleted || !user.isVerify) {
    return 0;
  }

  if (user.verificationOrder && user.verificationOrder > 0) {
    return user.verificationOrder;
  }

  const order = await UserModel.countDocuments({
    role: "user",
    isDeleted: false,
    isVerify: true,
    $or: [
      { createdAt: { $lt: user.createdAt! } },
      { createdAt: user.createdAt!, _id: { $lte: user._id } },
    ],
  });

  if (order > 0) {
    await UserModel.findByIdAndUpdate(userId, { verificationOrder: order });
  }

  return order;
};

export const resolveWelcomeTrialForOrder = async (verificationOrder: number) => {
  let config = await getOrCreateTrialConfig();
  config = await syncVerifiedUserCountIfNeeded(config);

  const promoLimit = config.promoLimit || 100;
  const isPromoUser =
    config.promoOn && verificationOrder > 0 && verificationOrder <= promoLimit;

  if (isPromoUser) {
    return {
      days: parseTrialDurationDays(config.promoDuration),
      isPromo: true,
      accessLabel: "promo" as const,
      verificationOrder,
      promoLimit,
    };
  }

  if (!config.trialOn) {
    return null;
  }

  return {
    days: parseTrialDurationDays(config.trialDuration),
    isPromo: false,
    accessLabel: "trial" as const,
    verificationOrder,
    promoLimit,
  };
};

/** @deprecated use resolveWelcomeTrialForOrder */
export const resolveWelcomeTrialForRegistration = resolveWelcomeTrialForOrder;
