import mongoose from "mongoose";
import dotenv from "dotenv";
import { UserModel } from "../modules/basic_modules/user/user.model";
import { PurchaseModel } from "../modules/basic_modules/subscription/subscription.model";
import { TrialConfigModel } from "../modules/basic_modules/subscription/subscription.model";

dotenv.config();

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  await mongoose.connect(url);
  console.log("MongoDB connected");

  const verifiedUsers = await UserModel.find({
    role: "user",
    isDeleted: false,
    isVerify: true,
  })
    .sort({ createdAt: 1 })
    .select("_id email registrationNumber createdAt");

  console.log(`Found ${verifiedUsers.length} verified user(s)`);

  for (let index = 0; index < verifiedUsers.length; index += 1) {
    const user = verifiedUsers[index];
    const verificationOrder =
      user.registrationNumber || index + 1;

    await PurchaseModel.updateMany(
      { userId: user._id },
      { $set: { verificationOrder } },
    );

    await UserModel.findByIdAndUpdate(user._id, {
      $unset: { registrationNumber: "" },
    });

    console.log(`User #${verificationOrder} ${user.email} -> purchase.verificationOrder`);
  }

  const verifiedUserCount = verifiedUsers.length;

  await TrialConfigModel.findOneAndUpdate(
    {},
    {
      $set: { verifiedUserCount },
      $setOnInsert: {
        promoOn: true,
        promoLimit: 100,
        promoDuration: "1 Month (30 Days)",
        trialOn: true,
        trialDuration: "2 Days",
      },
    },
    { upsert: true },
  );

  console.log(`TrialConfig.verifiedUserCount = ${verifiedUserCount}`);
  console.log("Removed registrationNumber from all users.");

  await mongoose.disconnect();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
