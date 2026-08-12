import { Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import AppError from "../../../errors/AppError";
import { AuthRequest } from "../../../middlewares/auth";
import {
  archiveSignal,
  closeSignal,
  createSignal,
  deleteSignal,
  duplicateSignal,
  formatSignalForApp,
  formatSignalForDashboard,
  getAdminSignals,
  getAppSignalById,
  getAppSignalChart,
  getAppSignalHistory,
  getAppSignalMarket,
  getAppSignals,
  publishSignal,
  setSignalAlerts,
  setSignalFavorite,
  updateSignal,
} from "./signal.service";
import { getGlobalMarketHours } from "../../../utils/marketHours";

export const getSignalsAdmin = catchAsync(async (req: AuthRequest, res: Response) => {
  const signals = await getAdminSignals(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Signals retrieved successfully",
    data: signals.map(formatSignalForDashboard),
  });
});

export const getMarketHoursHandler = catchAsync(async (_req: AuthRequest, res: Response) => {
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Global market hours retrieved successfully",
    data: getGlobalMarketHours(),
  });
});

export const getSignalsAppHistory = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const result = await getAppSignalHistory(req.user, req.query as Record<string, unknown>);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: {
      access: result.access,
      performanceOverview: result.performanceOverview,
      signals: result.signals,
      totalClosedSignals: result.totalClosedSignals,
    },
    pagination: result.pagination,
  });
});

export const getSignalsApp = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }
  const result = await getAppSignals(req.user, req.query as Record<string, unknown>);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: {
      access: result.access,
      signals: result.signals.map(formatSignalForApp),
    },
    pagination: result.pagination,
  });
});

export const getSignalAppDetail = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const result = await getAppSignalById(req.user, req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Signal details retrieved successfully.",
    data: {
      access: result.access,
      ...result.signal,
    },
  });
});

export const getSignalAppMarket = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const data = await getAppSignalMarket(req.user, req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Signal market data retrieved successfully.",
    data,
  });
});

export const getSignalAppChart = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const timeframe = String(req.query.timeframe || "1W");
  const data = await getAppSignalChart(req.user, req.params.id, timeframe);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Signal chart data retrieved successfully.",
    data,
  });
});

export const setSignalFavoriteHandler = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const enabled = req.body?.enabled !== false;
  const data = await setSignalFavorite(req.user, req.params.id, enabled);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: enabled ? "Signal added to favorites." : "Signal removed from favorites.",
    data,
  });
});

export const setSignalAlertsHandler = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const enabled = req.body?.enabled !== false;
  const data = await setSignalAlerts(req.user, req.params.id, enabled);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: enabled ? "Alerts enabled for this signal." : "Alerts disabled for this signal.",
    data,
  });
});

export const createSignalHandler = catchAsync(async (req: AuthRequest, res: Response) => {
  const signal = await createSignal(req.body, String(req.user?._id));
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Signal created successfully",
    data: formatSignalForDashboard(signal),
  });
});

export const updateSignalHandler = catchAsync(async (req: AuthRequest, res: Response) => {
  const signal = await updateSignal(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Signal updated successfully",
    data: formatSignalForDashboard(signal),
  });
});

export const deleteSignalHandler = catchAsync(async (req: AuthRequest, res: Response) => {
  await deleteSignal(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Signal deleted successfully",
    data: null,
  });
});

export const publishSignalHandler = catchAsync(async (req: AuthRequest, res: Response) => {
  const signal = await publishSignal(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Signal published successfully",
    data: formatSignalForDashboard(signal),
  });
});

export const closeSignalHandler = catchAsync(async (req: AuthRequest, res: Response) => {
  const { closeResult, closePnl, exitPrice } = req.body;
  const signal = await closeSignal(req.params.id, closeResult, closePnl, exitPrice);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Signal closed successfully",
    data: formatSignalForDashboard(signal),
  });
});

export const archiveSignalHandler = catchAsync(async (req: AuthRequest, res: Response) => {
  const signal = await archiveSignal(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Signal archived successfully",
    data: formatSignalForDashboard(signal),
  });
});

export const duplicateSignalHandler = catchAsync(async (req: AuthRequest, res: Response) => {
  const signal = await duplicateSignal(req.params.id, String(req.user?._id));
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Signal duplicated successfully",
    data: formatSignalForDashboard(signal),
  });
});
