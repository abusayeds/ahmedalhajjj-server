import { UserModel } from "../modules/basic_modules/user/user.model";
import { seedSubscriptions } from "../modules/basic_modules/subscription/subscription.seed";
import { seedSignalTypes } from "../modules/basic_modules/signal/signalType.seed";


const admin = {
  name: "MD Admin",
  email: "admin@gmail.com",
  password: "1qazxsw2",
  phone: "0000000000",
  address: "Local Seed Address",
  role: "admin",
  isDeleted: false,
};

export const seedSuperAdmin = async () => {
  const isSuperAdminExists = await UserModel.findOne({ email: admin.email });

  if (!isSuperAdminExists) {
    await UserModel.create(admin);
  }

  await seedSignalTypes();
  await seedSubscriptions();
};

export default seedSuperAdmin;
