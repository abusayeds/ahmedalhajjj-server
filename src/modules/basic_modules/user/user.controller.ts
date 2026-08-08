/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import httpStatus from "http-status";
import jwt from "jsonwebtoken";
import { JWT_SECRET_KEY, } from "../../../config";
import AppError from "../../../errors/AppError";
import { tokenDecoded } from "../../../middlewares/decoded";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import {
  findUserById,
  generateToken,
  getStoredOTP,
  userDelete,
  userService,
} from "./user.service";
import { AuthRequest } from "../../../middlewares/auth";
const registerUser = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    throw new AppError(httpStatus.BAD_REQUEST,
      "email is required.",
    );
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError(httpStatus.BAD_REQUEST,
      "Please provide a valid email address.",
    );
  }
  const result = await userService.createUserDB(req.body)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Verify OTP to register.",
    data: result
  });
});
const verifyOTP = catchAsync(async (req: Request, res: Response) => {
  const { otp } = req.body;
  const { decoded, }: any = await tokenDecoded(req, res)
  const email = decoded.email;
  const storedOTP = await getStoredOTP(email);
  if (!storedOTP || storedOTP !== otp) {
    throw new AppError(httpStatus.BAD_REQUEST,
      "Invalid or expired OTP",
    );
  }
  const result = await userService.verifyOtpDB(email)

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Registration successful.",
    data: result,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await userService.loginDB(email, password);
  const token = generateToken({
    _id: user._id,
    email: user.email,
    role: user.role,
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Login complete!",
    data: {
      user,
      token,
    },
  });
});
const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    throw new AppError(httpStatus.BAD_REQUEST,
      "Please provide an email.",
    );
  }
  await userService.forgotPasswordDB(email)
  const token = jwt.sign({ email, forgot: 'forgot' }, JWT_SECRET_KEY as string, { expiresIn: "7d", });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "OTP sent to your email. Please check!",
    data: {
      token: token,
    },
  });
},
);

const verifyForgotPasswordOTP = catchAsync(async (req: Request, res: Response) => {
  const { otp } = req.body;
  if (!otp) {
    throw new AppError(httpStatus.BAD_REQUEST, 'otp is required')
  }
  const { decoded }: any = await tokenDecoded(req, res)
  const email = decoded.email;
  const forgot = decoded.forgot
  if (forgot !== "forgot") {
    throw new AppError(httpStatus.BAD_REQUEST,
      "invalid token",
    );
  }
  const token = jwt.sign({ email, verifyForgot: 'verifyForgot' }, JWT_SECRET_KEY as string, { expiresIn: "7d", });
  if (!email) {
    throw new AppError(httpStatus.BAD_REQUEST,
      "Please provide a valid email address.",
    );
  }
  await userService.verifyForgotPasswordOtpDB(otp, email)
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "OTP verified successfully.",
    data: {
      token: token
    },
  });
},
);
const resendOTP = catchAsync(async (req: Request, res: Response) => {
  const { decoded, }: any = await tokenDecoded(req, res)
  const email = decoded.email;
  const token = jwt.sign({ email, forgot: 'forgot' }, JWT_SECRET_KEY as string, { expiresIn: "7d", });
  if (!email) {
    throw new AppError(httpStatus.BAD_REQUEST,
      "Please provide a valid email address.",
    );
  }
  await userService.resendOtpDB(email)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "A new OTP has been sent to your email.",
    data: { token },
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { decoded, }: any = await tokenDecoded(req, res)
  const verifyForgot = decoded.verifyForgot
  if (verifyForgot !== "verifyForgot") {
    throw new AppError(httpStatus.BAD_REQUEST,
      "invalid token",
    );
  }
  const email = decoded.email;
  if (!email) {
    throw new AppError(httpStatus.BAD_REQUEST,
      "Please provide a valid email address.",
    );
  }
  await userService.resetPasswordDB(req.body, email)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password reset successfully.",
    data: null,
  });

});
const changePassword = catchAsync(async (req: AuthRequest, res: Response) => {
  const email = req.user?.email as string;
  await userService.changePasswordDB(req.body, email)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "You have successfully changed the password.",
    data: null,
  });
},
);

const updateUser = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user?._id as string;
  const result = await userService.updateUserDB(req.body, req.file, userId)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile updated.",
    data: result,
  });

});

const myProfile = catchAsync(async (req: AuthRequest, res) => {
  const result = await userService.myProfileDB(req.user?._id as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "profile information retrieved successfully",
    data: result,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.allUserDB(req.query,)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User list retrieved successfully",
    data: result.user,
    pagination: result.pagination,
  });
});

const adminUpdateUser = catchAsync(async (req: AuthRequest, res: Response) => {
  const { userId, ...payload } = req.body;
  if (!userId) {
    throw new AppError(httpStatus.BAD_REQUEST, "userId is required.");
  }
  const result = await userService.adminUpdateUserDB(userId, payload);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User updated successfully.",
    data: result,
  });
});

const upgradeUserSubscription = catchAsync(async (req: AuthRequest, res: Response) => {
  const { userId, subscriptionType } = req.body;
  if (!userId || !subscriptionType) {
    throw new AppError(httpStatus.BAD_REQUEST, "userId and subscriptionType are required.");
  }
  const result = await userService.upgradeUserSubscriptionDB(userId, subscriptionType);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User subscription upgraded successfully.",
    data: result,
  });
});

const extendUserSubscription = catchAsync(async (req: AuthRequest, res: Response) => {
  const { userId, days } = req.body;
  if (!userId || !days) {
    throw new AppError(httpStatus.BAD_REQUEST, "userId and days are required.");
  }
  const result = await userService.extendUserSubscriptionDB(userId, Number(days));
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User subscription extended successfully.",
    data: result,
  });
});

export const userController = {
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
  verifyOTP,
  adminUpdateUser,
  upgradeUserSubscription,
  extendUserSubscription,
}

export const BlockUser = catchAsync(async (req: AuthRequest, res: Response) => {
  const { userId } = req.body;
  if (!userId) {
    throw new AppError(httpStatus.BAD_REQUEST, "userId is required.");
  }
  const user = await userService.toggleUserBlockDB(userId);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `User status changed to ${user?.status} successfully.`,
    data: user,
    pagination: undefined,
  });
});

export const deleteUser = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = (req.query?.id as string) || req.body?.userId;

  if (!id) {
    throw new AppError(httpStatus.BAD_REQUEST, "User id is required.");
  }

  const user = await findUserById(id);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND,
      "user not found .",
    );
  }

  if (user.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND,
      "user  is already deleted.",
    );
  }
  await userDelete(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "user deleted successfully",
    data: null,
  });
});


