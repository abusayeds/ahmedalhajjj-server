import { UserModel } from "../modules/basic_modules/user/user.model";
import { PurchaseModel } from "../modules/basic_modules/subscription/subscription.model";
import { IPurchase } from "../modules/basic_modules/subscription/subscription.interface";

export const findReusablePurchase = async (userId: string) => {
  const user = await UserModel.findById(userId).select("currentSubscription");

  if (user?.currentSubscription) {
    const linked = await PurchaseModel.findById(user.currentSubscription);
    if (linked && String(linked.userId) === String(userId)) {
      return linked;
    }
  }

  return PurchaseModel.findOne({ userId }).sort({ createdAt: -1 });
};

export const deactivateOtherPurchases = async (userId: string, keepPurchaseId: string) => {
  await PurchaseModel.updateMany(
    {
      userId,
      _id: { $ne: keepPurchaseId },
      isActive: true,
    },
    { $set: { isActive: false } },
  );
};

export const upsertUserPurchase = async (
  userId: string,
  data: Partial<IPurchase>,
): Promise<IPurchase> => {
  const existing = await findReusablePurchase(userId);

  if (existing?._id) {
    const purchaseId = String(existing._id);
    const unsetFields: Record<string, ""> = { cancelledAt: "" };
    if (data.isFreeTrial === false) {
      unsetFields.freeTrialEndDate = "";
    }

    const updated = await PurchaseModel.findByIdAndUpdate(
      purchaseId,
      {
        $set: {
          ...data,
          userId,
        },
        $unset: unsetFields,
      },
      { new: true },
    );

    if (!updated) {
      throw new Error("Failed to update existing purchase record.");
    }

    await deactivateOtherPurchases(userId, purchaseId);
    return updated;
  }

  const created = await PurchaseModel.create({
    userId,
    autoRenew: true,
    renewalAttempts: 0,
    ...data,
  });

  await deactivateOtherPurchases(userId, String(created._id));
  return created;
};
