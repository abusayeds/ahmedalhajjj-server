import { Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { AuthRequest } from "../../../middlewares/auth";
import { getDashboardStats } from "./dashboard.service";

export const getDashboardStatsHandler = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const range = (req.query.range as "7D" | "30D" | "6M") || "6M";
    const stats = await getDashboardStats(range);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Dashboard stats retrieved successfully",
      data: stats,
    });
  },
);
