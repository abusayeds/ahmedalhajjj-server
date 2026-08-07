import { Request, Response } from "express";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import {
  getAllCoupons,
  getCouponById,
  createCoupon as createCouponService,
  updateCoupon as updateCouponService,
  deleteCoupon as deleteCouponService,
  validateAndApplyCoupon,
} from "./coupon.service";

export const getCoupons = catchAsync(async (req: Request, res: Response) => {
  const coupons = await getAllCoupons();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Coupons retrieved successfully",
    data: coupons,
  });
});

export const getCouponDetail = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const coupon = await getCouponById(id);
  if (!coupon) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "Coupon not found",
      data: null,
    });
  }
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Coupon retrieved successfully",
    data: coupon,
  });
});

export const createCoupon = catchAsync(async (req: Request, res: Response) => {
  const coupon = await createCouponService(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Coupon created successfully",
    data: coupon,
  });
});

export const updateCoupon = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const coupon = await updateCouponService(id, req.body);
  if (!coupon) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "Coupon not found",
      data: null,
    });
  }
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Coupon updated successfully",
    data: coupon,
  });
});

export const deleteCoupon = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const coupon = await deleteCouponService(id);
  if (!coupon) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "Coupon not found",
      data: null,
    });
  }
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Coupon deleted successfully",
    data: coupon,
  });
});

export const validateCoupon = catchAsync(async (req: Request, res: Response) => {
  const { code } = req.body;
  if (!code) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "Coupon code is required",
      data: null,
    });
  }
  try {
    const coupon = await validateAndApplyCoupon(code);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Coupon is valid",
      data: coupon,
    });
  } catch (err: any) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: err.message || "Invalid coupon",
      data: null,
    });
  }
});
