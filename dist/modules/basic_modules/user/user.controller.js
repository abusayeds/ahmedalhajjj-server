"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.BlockUser = exports.userController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../../../config");
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const decoded_1 = require("../../../middlewares/decoded");
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse"));
const user_model_1 = require("./user.model");
const user_service_1 = require("./user.service");
const registerUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "email is required.");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Please provide a valid email address.");
    }
    const result = yield user_service_1.userService.createUserDB(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Verify OTP to register.",
        data: result
    });
}));
const verifyOTP = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { otp } = req.body;
    const { decoded, } = yield (0, decoded_1.tokenDecoded)(req, res);
    const email = decoded.email;
    const storedOTP = yield (0, user_service_1.getStoredOTP)(email);
    if (!storedOTP || storedOTP !== otp) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Invalid or expired OTP");
    }
    const result = yield user_service_1.userService.verifyOtpDB(email);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Registration successful.",
        data: result,
    });
}));
const loginUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = yield user_service_1.userService.loginDB(email, password);
    const token = (0, user_service_1.generateToken)({
        _id: user._id,
        email: user.email,
        role: user.role,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Login complete!",
        data: {
            user,
            token,
        },
    });
}));
const forgotPassword = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Please provide an email.");
    }
    yield user_service_1.userService.forgotPasswordDB(email);
    const token = jsonwebtoken_1.default.sign({ email, forgot: 'forgot' }, config_1.JWT_SECRET_KEY, { expiresIn: "7d", });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "OTP sent to your email. Please check!",
        data: {
            token: token,
        },
    });
}));
const verifyForgotPasswordOTP = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { otp } = req.body;
    if (!otp) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'otp is required');
    }
    const { decoded } = yield (0, decoded_1.tokenDecoded)(req, res);
    const email = decoded.email;
    const forgot = decoded.forgot;
    if (forgot !== "forgot") {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "invalid token");
    }
    const token = jsonwebtoken_1.default.sign({ email, verifyForgot: 'verifyForgot' }, config_1.JWT_SECRET_KEY, { expiresIn: "7d", });
    if (!email) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Please provide a valid email address.");
    }
    yield user_service_1.userService.verifyForgotPasswordOtpDB(otp, email);
    return (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "OTP verified successfully.",
        data: {
            token: token
        },
    });
}));
const resendOTP = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { decoded, } = yield (0, decoded_1.tokenDecoded)(req, res);
    const email = decoded.email;
    const token = jsonwebtoken_1.default.sign({ email, forgot: 'forgot' }, config_1.JWT_SECRET_KEY, { expiresIn: "7d", });
    if (!email) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Please provide a valid email address.");
    }
    yield user_service_1.userService.resendOtpDB(email);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "A new OTP has been sent to your email.",
        data: { token },
    });
}));
const resetPassword = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { decoded, } = yield (0, decoded_1.tokenDecoded)(req, res);
    const verifyForgot = decoded.verifyForgot;
    if (verifyForgot !== "verifyForgot") {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "invalid token");
    }
    const email = decoded.email;
    if (!email) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Please provide a valid email address.");
    }
    yield user_service_1.userService.resetPasswordDB(req.body, email);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Password reset successfully.",
        data: null,
    });
}));
const changePassword = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { decoded, } = yield (0, decoded_1.tokenDecoded)(req, res);
    const email = decoded.user.email;
    yield user_service_1.userService.changePasswordDB(req.body, email);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "You have successfully changed the password.",
        data: null,
    });
}));
const updateUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { decoded, } = yield (0, decoded_1.tokenDecoded)(req, res);
    const userId = decoded.user._id;
    const result = yield user_service_1.userService.updateUserDB(req.body, req.file, userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Profile updated.",
        data: result,
    });
}));
const myProfile = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const result = yield user_service_1.userService.myProfileDB((_a = req.user) === null || _a === void 0 ? void 0 : _a._id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "profile information retrieved successfully",
        data: result,
    });
}));
const getAllUsers = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const rersult = yield user_service_1.userService.allUserDB(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User list retrieved successfully",
        data: rersult
    });
}));
exports.userController = {
    registerUser,
    loginUser,
    forgotPassword,
    verifyForgotPasswordOTP,
    resendOTP,
    resetPassword,
    changePassword,
    updateUser,
    myProfile,
    getAllUsers,
    verifyOTP
};
exports.BlockUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    const { decoded, } = yield (0, decoded_1.tokenDecoded)(req, res);
    const adminId = decoded.id;
    const requestingUser = yield user_model_1.UserModel.findById(adminId);
    if (!requestingUser || requestingUser.role !== "admin") {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "Unauthorized: Only admins can change user status.");
    }
    const user = yield user_model_1.UserModel.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found.");
    }
    if (user.role === "admin") {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "Cannot change status of an admin user.");
    }
    user.status = user.status === "active" ? "blocked" : "active";
    yield user.save();
    return (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: `User status changed to ${user.status} successfully.`,
        data: null,
        pagination: undefined,
    });
}));
exports.deleteUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = (_a = req.query) === null || _a === void 0 ? void 0 : _a.id;
    const user = yield (0, user_service_1.findUserById)(id);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "user not found .");
    }
    if (user.isDeleted) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "user  is already deleted.");
    }
    yield (0, user_service_1.userDelete)(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "user deleted successfully",
        data: null,
    });
}));
