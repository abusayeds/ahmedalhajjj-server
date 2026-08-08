"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("./user.controller");
const user_validation_1 = require("./user.validation");
const zodValidationHandler_1 = __importDefault(require("../../../middlewares/zodValidationHandler"));
const auth_1 = require("../../../middlewares/auth");
const role_1 = require("../../../utils/role");
const router = express_1.default.Router();
// 1. Register User
router.post("/register", (0, zodValidationHandler_1.default)(user_validation_1.userValidation.registerUserValidation), user_controller_1.userController.registerUser);
// 2. Verify OTP
router.post("/verify-otp", user_controller_1.userController.verifyOTP);
// 3. Login User
router.post("/login", user_controller_1.userController.loginUser);
// 4. Resend OTP
router.post("/resend", user_controller_1.userController.resendOTP);
router.post("/resend-otp", user_controller_1.userController.resendOTP);
// 5. Forgot Password
router.post("/forget-password", user_controller_1.userController.forgotPassword);
router.post("/forgot-password", user_controller_1.userController.forgotPassword);
// 6. Verify Forgot Password OTP
router.post("/verify-forget-otp", user_controller_1.userController.verifyForgotPasswordOTP);
router.post("/verify-forgot-otp", user_controller_1.userController.verifyForgotPasswordOTP);
// Reset Password
router.post("/reset-password", (0, zodValidationHandler_1.default)(user_validation_1.userValidation.resetPassWordValidation), user_controller_1.userController.resetPassword);
// 7. Change Password
router.post("/change-password", (0, auth_1.authMiddleware)(role_1.role.admin, role_1.role.user), user_controller_1.userController.changePassword);
// 8. My Profile
router.get("/my-profile", (0, auth_1.authMiddleware)(role_1.role.admin, role_1.role.user), user_controller_1.userController.myProfile);
router.get("/profile", (0, auth_1.authMiddleware)(role_1.role.admin, role_1.role.user), user_controller_1.userController.myProfile);
// 9. Update Profile
router.post("/update", (0, auth_1.authMiddleware)(role_1.role.admin, role_1.role.user), (0, zodValidationHandler_1.default)(user_validation_1.userValidation.updateUserValidation), user_controller_1.userController.updateUser);
router.patch("/update-profile", (0, auth_1.authMiddleware)(role_1.role.admin, role_1.role.user), (0, zodValidationHandler_1.default)(user_validation_1.userValidation.updateUserValidation), user_controller_1.userController.updateUser);
router.post("/update-profile", (0, auth_1.authMiddleware)(role_1.role.admin, role_1.role.user), (0, zodValidationHandler_1.default)(user_validation_1.userValidation.updateUserValidation), user_controller_1.userController.updateUser);
// User Management
router.get("/all-user", (0, auth_1.authMiddleware)(role_1.role.admin), user_controller_1.userController.getAllUsers);
router.post("/block-user", (0, auth_1.authMiddleware)(role_1.role.admin), user_controller_1.BlockUser);
router.post("/delete", (0, auth_1.authMiddleware)(role_1.role.admin), user_controller_1.deleteUser);
router.post("/admin-update-user", (0, auth_1.authMiddleware)(role_1.role.admin), (0, zodValidationHandler_1.default)(user_validation_1.userValidation.adminUpdateUserValidation), user_controller_1.userController.adminUpdateUser);
router.post("/upgrade-subscription", (0, auth_1.authMiddleware)(role_1.role.admin), (0, zodValidationHandler_1.default)(user_validation_1.userValidation.upgradeSubscriptionValidation), user_controller_1.userController.upgradeUserSubscription);
router.post("/extend-subscription", (0, auth_1.authMiddleware)(role_1.role.admin), (0, zodValidationHandler_1.default)(user_validation_1.userValidation.extendSubscriptionValidation), user_controller_1.userController.extendUserSubscription);
exports.UserRoutes = router;
