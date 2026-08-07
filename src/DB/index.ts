import { UserModel } from "../modules/basic_modules/user/user.model";
import { seedSubscriptions } from "../modules/basic_modules/subscription/subscription.seed";


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

  // Seed subscriptions
  await seedSubscriptions();
};

export default seedSuperAdmin;
