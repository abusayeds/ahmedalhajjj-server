import { z } from "zod";

const loginValidation = z.object({
  body: z.object({
    email: z
      .string({
        required_error: "Email is required!",
        invalid_type_error: "Email must be a string",
      })
      .email(),
    password: z.string({
      required_error: "Password is required!",
      invalid_type_error: "Password must be a string",
    }),
  }),
});

const registerUserValidation = z.object({
  body: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    name: z.string().optional(),
    email: z
      .string({
        required_error: "Email is required!",
        invalid_type_error: "Email must be a string",
      })
      .email(),
    password: z
      .string({
        required_error: "Password is required!",
        invalid_type_error: "Password must be a string",
      })
      .min(6, "Password must be at least 6 characters long"),
    confirmPassword: z
      .string({
        required_error: "Confirm password is required!",
        invalid_type_error: "Confirm password must be a string",
      })
      .min(6, "Confirm password must be at least 6 characters long"),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),
});

const updateUserValidation = z.object({
  body: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    name: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    image: z.string().optional(),
  }),
});

const resetPassWordValidation = z.object({
  body: z.object({
    password: z
      .string({
        required_error: "Password is required!",
        invalid_type_error: "Password must be a string",
      })
      .min(6, "Password must be at least 6 characters long"),
    confirmPassword: z
      .string({
        required_error: "Confirm password is required!",
        invalid_type_error: "Confirm password must be a string",
      })
      .min(6, "Confirm password must be at least 6 characters long"),
  }),
});

export const userValidation = {
  registerUserValidation,
  loginValidation,
  resetPassWordValidation,
  updateUserValidation,
};
