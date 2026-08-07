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
        phone: zod_1.z.string().optional(),
        address: zod_1.z.string().optional(),
        image: zod_1.z.string().optional(),
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
};
