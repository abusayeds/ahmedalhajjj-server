import { UserModel } from "../modules/basic_modules/user/user.model";


const admin = {
  name: "MD Admin",
  email: "admin@gmail.com",
  password: "1qazxsw2",
  role: "admin",
  isDeleted: false,
};

export const seedSuperAdmin = async () => {
  const isSuperAdminExists = await UserModel.findOne({ email: admin.email });

  if (!isSuperAdminExists) {

    // console.log("Super Admin created");
    await UserModel.create(admin);
  }
};

export default seedSuperAdmin;
