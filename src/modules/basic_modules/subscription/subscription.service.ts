import { SubscriptionModel, PurchaseModel, TrialConfigModel } from "./subscription.model";
import { ISubscription, IPurchase, ITrialConfig } from "./subscription.interface";

// Subscription Services
export const getAllSubscriptions = async () => {
  return await SubscriptionModel.find({});
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
  return config;
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
  const purchase = await PurchaseModel.findOne({
    userId,
    isFreeTrial: true,
  }).sort({ createdAt: -1 });

  if (!purchase) {
    return { hasUsedFreeTrial: false };
  }

  const now = new Date();
  const trialEnded = purchase.freeTrialEndDate && purchase.freeTrialEndDate < now;

  return {
    hasUsedFreeTrial: true,
    isTrialActive: !trialEnded,
    trialEndDate: purchase.freeTrialEndDate,
  };
};
