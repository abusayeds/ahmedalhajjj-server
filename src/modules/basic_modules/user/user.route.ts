import express from "express";
import {
  BlockUser,
  deleteUser,
  userController,
} from "./user.controller";
import { userValidation } from "./user.validation";
import zodValidation from "../../../middlewares/zodValidationHandler";
import { authMiddleware } from "../../../middlewares/auth";
import { role } from "../../../utils/role";

const router = express.Router();

// 1. Register User
router.post("/register", zodValidation(userValidation.registerUserValidation), userController.registerUser);

// 2. Verify OTP
router.post("/verify-otp", userController.verifyOTP);

// 3. Login User
router.post("/login", userController.loginUser);

// 4. Resend OTP
router.post("/resend", userController.resendOTP);
router.post("/resend-otp", userController.resendOTP);

// 5. Forgot Password
router.post("/forget-password", userController.forgotPassword);
router.post("/forgot-password", userController.forgotPassword);

// 6. Verify Forgot Password OTP
router.post("/verify-forget-otp", userController.verifyForgotPasswordOTP);
router.post("/verify-forgot-otp", userController.verifyForgotPasswordOTP);

// Reset Password
router.post("/reset-password", zodValidation(userValidation.resetPassWordValidation), userController.resetPassword);

// 7. Change Password
router.post("/change-password", authMiddleware(role.admin, role.user), userController.changePassword);

// 8. My Profile
router.get("/my-profile", authMiddleware(role.admin , role.user), userController.myProfile);
router.get("/profile", authMiddleware(role.admin , role.user), userController.myProfile);

// 9. Update Profile
router.post("/update", authMiddleware(role.admin, role.user), zodValidation(userValidation.updateUserValidation), userController.updateUser);
router.patch("/update-profile", authMiddleware(role.admin, role.user), zodValidation(userValidation.updateUserValidation), userController.updateUser);
router.post("/update-profile", authMiddleware(role.admin, role.user), zodValidation(userValidation.updateUserValidation), userController.updateUser);

// User Management
router.get("/all-user", authMiddleware(role.admin), userController.getAllUsers);
router.post("/block-user", authMiddleware(role.admin), BlockUser);
router.post("/delete", authMiddleware(role.admin), deleteUser);
router.post("/admin-update-user", authMiddleware(role.admin), zodValidation(userValidation.adminUpdateUserValidation), userController.adminUpdateUser);
router.post("/upgrade-subscription", authMiddleware(role.admin), zodValidation(userValidation.upgradeSubscriptionValidation), userController.upgradeUserSubscription);
router.post("/extend-subscription", authMiddleware(role.admin), zodValidation(userValidation.extendSubscriptionValidation), userController.extendUserSubscription);

export const UserRoutes = router;
