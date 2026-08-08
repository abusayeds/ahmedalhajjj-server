"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userValidation = void 0;
const zod_1 = require("zod");
const loginValidation = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z
            .string({
            required_error: "Email is required!",
            invalid_type_error: "Email must be a string",
        })
            .email(),
        password: zod_1.z.string({
            required_error: "Password is required!",
            invalid_type_error: "Password must be a string",
        }),
    }),
});
const registerUserValidation = zod_1.z.object({
    body: zod_1.z.object({
        firstName: zod_1.z.string().optional(),
        lastName: zod_1.z.string().optional(),
        name: zod_1.z.string().optional(),
        email: zod_1.z
            .string({
            required_error: "Email is required!",
            invalid_type_error: "Email must be a string",
        })
            .email(),
        password: zod_1.z
            .string({
            required_error: "Password is required!",
            invalid_type_error: "Password must be a string",
        })
            .min(6, "Password must be at least 6 characters long"),
        confirmPassword: zod_1.z
            .string({
            required_error: "Confirm password is required!",
            invalid_type_error: "Confirm password must be a string",
        })
            .min(6, "Confirm password must be at least 6 characters long"),
        phone: zod_1.z.string().optional(),
        address: zod_1.z.string().optional(),
    }),
});
const updateUserValidation = zod_1.z.object({
    body: zod_1.z.object({
        firstName: zod_1.z.string().optional(),
        lastName: zod_1.z.string().optional(),
        name: zod_1.z.string().optional(),
        email: zod_1.z.string().email().optional(),
        phone: zod_1.z.string().optional(),
        address: zod_1.z.string().optional(),
        image: zod_1.z.string().optional(),
    }),
});
const adminUpdateUserValidation = zod_1.z.object({
    body: zod_1.z.object({
        userId: zod_1.z.string({ required_error: "userId is required!" }),
        name: zod_1.z.string().optional(),
        firstName: zod_1.z.string().optional(),
        lastName: zod_1.z.string().optional(),
        email: zod_1.z.string().email().optional(),
        subscriptionType: zod_1.z.enum(["VIP", "Forex", "Crypto"]).optional(),
        subscriptionStatus: zod_1.z.enum(["active", "trial", "expired", "cancelled", "none"]).optional(),
        status: zod_1.z.enum(["active", "blocked"]).optional(),
    }),
});
const upgradeSubscriptionValidation = zod_1.z.object({
    body: zod_1.z.object({
        userId: zod_1.z.string({ required_error: "userId is required!" }),
        subscriptionType: zod_1.z.enum(["VIP", "Forex", "Crypto"], {
            required_error: "subscriptionType is required!",
        }),
    }),
});
const extendSubscriptionValidation = zod_1.z.object({
    body: zod_1.z.object({
        userId: zod_1.z.string({ required_error: "userId is required!" }),
        days: zod_1.z.coerce.number().min(1, "days must be at least 1"),
    }),
});
const resetPassWordValidation = zod_1.z.object({
    body: zod_1.z.object({
        password: zod_1.z
            .string({
            required_error: "Password is required!",
            invalid_type_error: "Password must be a string",
        })
            .min(6, "Password must be at least 6 characters long"),
        confirmPassword: zod_1.z
            .string({
            required_error: "Confirm password is required!",
            invalid_type_error: "Confirm password must be a string",
        })
            .min(6, "Confirm password must be at least 6 characters long"),
    }),
});
exports.userValidation = {
    registerUserValidation,
    loginValidation,
    resetPassWordValidation,
    updateUserValidation,
    adminUpdateUserValidation,
    upgradeSubscriptionValidation,
    extendSubscriptionValidation,
};
