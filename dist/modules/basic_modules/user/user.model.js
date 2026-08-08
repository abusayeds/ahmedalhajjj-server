"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTPModel = exports.UserModel = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const mongoose_1 = __importStar(require("mongoose"));
const UserSchema = new mongoose_1.Schema({
    firstName: { type: String, trim: true, required: false },
    lastName: { type: String, trim: true, required: false },
    email: { type: String, required: false, unique: true, trim: true },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: 3,
        set: (v) => bcrypt_1.default.hashSync(v, bcrypt_1.default.genSaltSync(Number(12))),
        select: 0,
    },
    phone: { type: String, trim: true, required: false },
    address: { type: String, required: false, trim: true },
    image: {
        type: {
            publicFileURL: { type: String, trim: true },
            path: { type: String, trim: true },
        },
        required: false,
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user",
    },
    status: {
        type: String,
        enum: ["active", "blocked"],
        default: "active",
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    isVerify: {
        type: Boolean,
        default: false,
    },
    currentSubscription: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Purchase",
        default: null,
    },
    subscriptionType: {
        type: String,
        enum: ["VIP", "Forex", "Crypto", null],
        default: null,
    },
    subscriptionStatus: {
        type: String,
        enum: ["active", "trial", "expired", "cancelled", "none"],
        default: "none",
    },
    subscriptionEndDate: { type: Date },
    freeTrialEndDate: { type: Date },
    hasUsedFreeAccess: { type: Boolean, default: false },
    promoAccessUsed: { type: Boolean, default: false },
}, { timestamps: true });
UserSchema.pre("save", function (next) {
    if ((this.firstName || this.lastName) && !this.name) {
        this.name = `${this.firstName || ""} ${this.lastName || ""}`.trim();
    }
    next();
});
exports.UserModel = mongoose_1.default.models.User || mongoose_1.default.model("User", UserSchema);
const OTPSchema = new mongoose_1.Schema({
    email: { type: String, required: true, trim: true },
    otp: { type: String, required: true, trim: true },
    expiresAt: { type: Date, required: true },
});
exports.OTPModel = mongoose_1.default.model("OTP", OTPSchema);
