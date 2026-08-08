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
exports.userDelete = exports.userService = exports.saveOTP = exports.findUserById = exports.findUserByEmail = exports.generateOTP = exports.getStoredOTP = exports.hashPassword = exports.generateToken = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const bcrypt_1 = __importDefault(require("bcrypt"));
const http_status_1 = __importDefault(require("http-status"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const queryBuilder_1 = __importDefault(require("../../../builder/queryBuilder"));
const config_1 = require("../../../config");
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const sendEmail_1 = require("./sendEmail");
const user_model_1 = require("./user.model");
const generateToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, config_1.JWT_SECRET_KEY, { expiresIn: "7d" });
};
exports.generateToken = generateToken;
const hashPassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    return bcrypt_1.default.hash(password, 12);
});
exports.hashPassword = hashPassword;
const getStoredOTP = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const otpRecord = yield user_model_1.OTPModel.findOne({ email });
    return otpRecord ? otpRecord.otp : null;
});
exports.getStoredOTP = getStoredOTP;
const generateOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(otp);
    return otp;
};
exports.generateOTP = generateOTP;
const findUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    return user_model_1.UserModel.findOne({ email }).select('+password');
});
exports.findUserByEmail = findUserByEmail;
const findUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return user_model_1.UserModel.findById(id);
});
exports.findUserById = findUserById;
const saveOTP = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    yield user_model_1.OTPModel.findOneAndUpdate({ email }, { otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) }, { upsert: true, new: true });
});
exports.saveOTP = saveOTP;
const createUserDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserRegistered = yield user_model_1.UserModel.findOne({ email: payload.email });
    const { password, confirmPassword } = payload;
    if (isUserRegistered && isUserRegistered.isVerify === true) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "You already have an account.");
    }
    if (password !== confirmPassword) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Passwords do not match');
    }
    if (isUserRegistered && isUserRegistered.isVerify === false) {
        yield user_model_1.UserModel.findOneAndUpdate({ email: payload.email }, payload, { new: true, upsert: true });
    }
    else if (!isUserRegistered) {
        yield user_model_1.UserModel.create(payload);
    }
    const email = payload.email;
    const otp = (0, exports.generateOTP)();
    console.log(otp);
    yield (0, exports.saveOTP)(email, otp);
    yield (0, sendEmail_1.sendRegistationOtpEmail)(otp, email);
    const token = jsonwebtoken_1.default.sign({ email }, config_1.JWT_SECRET_KEY, { expiresIn: "7d" });
    return {
        token: token
    };
});
const verifyOtpDB = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.UserModel.findOne({ email: email });
    if (user.isVerify) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Alredy verified");
    }
    const result = yield user_model_1.UserModel.findOneAndUpdate({ email: email, }, { isVerify: true }, { new: true, upsert: true, });
    return {
        _id: result._id,
        email: result.email
    };
});
const loginDB = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield (0, exports.findUserByEmail)(email);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "This account does not exist.");
    }
    if (user.isDeleted) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "your account is deleted by admin.");
    }
    if (!user.isVerify) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "Email is not verified. Please verify your OTP/email first before logging in.");
    }
    const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
    if (!isPasswordValid) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Wrong password!");
    }
    const userSafe = Object.assign({}, user.toObject ? user.toObject() : user);
    delete userSafe.password;
    delete userSafe.isVerify;
    return userSafe;
});
const forgotPasswordDB = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.UserModel.findOne({ email: email, isVerify: true });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "This account does not exist.");
    }
    const otp = (0, exports.generateOTP)();
    yield (0, exports.saveOTP)(email, otp);
    yield (0, sendEmail_1.sendEmail)(otp, email);
});
const verifyForgotPasswordOtpDB = (otp, email) => __awaiter(void 0, void 0, void 0, function* () {
    const otpRecord = yield user_model_1.OTPModel.findOne({ email });
    if (!otpRecord) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found!");
    }
    const currentTime = new Date();
    if (otpRecord.expiresAt < currentTime) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "OTP has expired");
    }
    if (otpRecord.otp !== otp) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Wrong OTP");
    }
});
const resendOtpDB = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const newOTP = (0, exports.generateOTP)();
    yield (0, exports.saveOTP)(email, newOTP);
    yield (0, sendEmail_1.sendEmail)(newOTP, email);
});
const resetPasswordDB = (payload, email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield (0, exports.findUserByEmail)(email);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found.");
    }
    if (payload.confirmPassword !== payload.password) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Passwords do not match');
    }
    yield user_model_1.UserModel.findOneAndUpdate({ email: email }, payload, { new: true });
});
const changePasswordDB = (payload, email) => __awaiter(void 0, void 0, void 0, function* () {
    const { oldPassword, newPassword, confirmPassword } = payload;
    if (!oldPassword || !newPassword || !confirmPassword) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Please provide oldPassword, newPassword, and confirmPassword.");
    }
    const user = yield (0, exports.findUserByEmail)(email);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found.");
    }
    const isMatch = yield bcrypt_1.default.compare(oldPassword, user.password);
    if (!isMatch) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Old password is incorrect.");
    }
    if (newPassword !== confirmPassword) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "New password and confirm password do not match.");
    }
    yield user_model_1.UserModel.findOneAndUpdate({ email: email }, { password: newPassword }, { new: true });
});
const updateUserDB = (payload, file, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield (0, exports.findUserById)(userId);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found.");
    }
    if (payload.email && payload.email !== user.email) {
        const existingEmail = yield user_model_1.UserModel.findOne({ email: payload.email });
        if (existingEmail && String(existingEmail._id) !== String(userId)) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Email is already in use.");
        }
    }
    const updateData = Object.assign({}, payload);
    if (payload.name && !payload.firstName && !payload.lastName) {
        const nameParts = payload.name.trim().split(/\s+/);
        updateData.firstName = nameParts[0] || "";
        updateData.lastName = nameParts.slice(1).join(" ") || "";
        updateData.name = payload.name.trim();
    }
    if (file) {
        const imagePath = `public\\images\\${file.filename}`;
        const publicFileURL = `/images/${file.filename}`;
        updateData.image = {
            path: imagePath,
            publicFileURL: publicFileURL,
        };
    }
    const result = yield user_model_1.UserModel.findByIdAndUpdate(userId, updateData, { new: true });
    const updateUser = Object.assign({}, result.toObject ? result.toObject() : result);
    delete updateUser.password;
    delete updateUser.isVerify;
    return updateUser;
});
const myProfileDB = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.UserModel.findById(userId).select('-password -isVerify');
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found.");
    }
    return user;
});
const allUserDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const baseFilter = { role: "user", isDeleted: false };
    if (query.subscriptionType) {
        baseFilter.subscriptionType = query.subscriptionType;
    }
    const userQuery = new queryBuilder_1.default(user_model_1.UserModel.find(baseFilter).select('-password -isVerify'), query)
        .search(["firstName", "lastName", "name", "email"])
        .filter()
        .sort();
    const { totalData } = yield userQuery.paginate(user_model_1.UserModel.find(baseFilter));
    const user = yield userQuery.modelQuery.exec();
    const currentPage = Number(query === null || query === void 0 ? void 0 : query.page) || 1;
    const limit = Number(query.limit) || 10;
    const pagination = userQuery.calculatePagination({
        totalData,
        currentPage,
        limit,
    });
    return { pagination, user, };
});
const adminUpdateUserDB = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield (0, exports.findUserById)(userId);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found.");
    }
    if (user.role === "admin") {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "Cannot update an admin user.");
    }
    const updateData = {};
    if (payload.name) {
        const nameParts = payload.name.trim().split(/\s+/);
        updateData.firstName = nameParts[0] || "";
        updateData.lastName = nameParts.slice(1).join(" ") || "";
        updateData.name = payload.name.trim();
    }
    if (payload.firstName !== undefined)
        updateData.firstName = payload.firstName;
    if (payload.lastName !== undefined)
        updateData.lastName = payload.lastName;
    if (payload.email) {
        const existingEmail = yield user_model_1.UserModel.findOne({ email: payload.email });
        if (existingEmail && String(existingEmail._id) !== String(userId)) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Email is already in use.");
        }
        updateData.email = payload.email;
    }
    if (payload.subscriptionType)
        updateData.subscriptionType = payload.subscriptionType;
    if (payload.subscriptionStatus)
        updateData.subscriptionStatus = payload.subscriptionStatus;
    if (payload.status)
        updateData.status = payload.status;
    const result = yield user_model_1.UserModel.findByIdAndUpdate(userId, updateData, { new: true }).select('-password -isVerify');
    return result;
});
const upgradeUserSubscriptionDB = (userId, subscriptionType) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield (0, exports.findUserById)(userId);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found.");
    }
    if (user.role === "admin") {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "Cannot update an admin user.");
    }
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    const result = yield user_model_1.UserModel.findByIdAndUpdate(userId, {
        subscriptionType,
        subscriptionStatus: "active",
        subscriptionEndDate: endDate,
    }, { new: true }).select('-password -isVerify');
    return result;
});
const extendUserSubscriptionDB = (userId, days) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield (0, exports.findUserById)(userId);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found.");
    }
    if (user.role === "admin") {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "Cannot update an admin user.");
    }
    const baseDate = user.subscriptionEndDate && user.subscriptionEndDate > new Date()
        ? new Date(user.subscriptionEndDate)
        : new Date();
    baseDate.setDate(baseDate.getDate() + days);
    const result = yield user_model_1.UserModel.findByIdAndUpdate(userId, {
        subscriptionEndDate: baseDate,
        subscriptionStatus: user.subscriptionStatus === "expired" ? "active" : user.subscriptionStatus,
    }, { new: true }).select('-password -isVerify');
    return result;
});
const toggleUserBlockDB = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield (0, exports.findUserById)(userId);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found.");
    }
    if (user.role === "admin") {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "Cannot change status of an admin user.");
    }
    const nextStatus = user.status === "blocked" ? "active" : "blocked";
    const result = yield user_model_1.UserModel.findByIdAndUpdate(userId, { status: nextStatus }, { new: true }).select('-password -isVerify');
    return result;
});
exports.userService = {
    createUserDB,
    verifyOtpDB,
    loginDB,
    forgotPasswordDB,
    verifyForgotPasswordOtpDB,
    resendOtpDB,
    resetPasswordDB,
    changePasswordDB,
    updateUserDB,
    myProfileDB,
    allUserDB,
    adminUpdateUserDB,
    upgradeUserSubscriptionDB,
    extendUserSubscriptionDB,
    toggleUserBlockDB,
};
const userDelete = (id) => __awaiter(void 0, void 0, void 0, function* () {
    yield user_model_1.UserModel.findByIdAndUpdate(id, { isDeleted: true });
});
exports.userDelete = userDelete;
