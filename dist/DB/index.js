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
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedSuperAdmin = void 0;
const user_model_1 = require("../modules/basic_modules/user/user.model");
const subscription_seed_1 = require("../modules/basic_modules/subscription/subscription.seed");
const admin = {
    name: "MD Admin",
    email: "admin@gmail.com",
    password: "1qazxsw2",
    phone: "0000000000",
    address: "Local Seed Address",
    role: "admin",
    isDeleted: false,
};
const seedSuperAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    const isSuperAdminExists = yield user_model_1.UserModel.findOne({ email: admin.email });
    if (!isSuperAdminExists) {
        yield user_model_1.UserModel.create(admin);
    }
    // Seed subscriptions
    yield (0, subscription_seed_1.seedSubscriptions)();
});
exports.seedSuperAdmin = seedSuperAdmin;
exports.default = exports.seedSuperAdmin;
