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
router.post("/change-password", userController.changePassword);

// 8. My Profile
router.get("/my-profile", authMiddleware(role.admin), userController.myProfile);
router.get("/profile", authMiddleware(role.admin), userController.myProfile);

// 9. Update Profile
router.post("/update", zodValidation(userValidation.updateUserValidation), userController.updateUser);
router.patch("/update-profile", zodValidation(userValidation.updateUserValidation), userController.updateUser);
router.post("/update-profile", zodValidation(userValidation.updateUserValidation), userController.updateUser);

// User Management
router.get("/all-user", authMiddleware(role.admin), userController.getAllUsers);
router.post("/block-user", authMiddleware(role.admin), BlockUser);
router.post("/delete", authMiddleware(role.admin), deleteUser);

export const UserRoutes = router;
