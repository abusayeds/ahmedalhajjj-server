import { Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import AppError from "../../../errors/AppError";
import { AuthRequest } from "../../../middlewares/auth";
import {
  createNotificationRecord,
  deleteNotification,
  formatNotificationForDashboard,
  getAdminNotifications,
  getAppNotifications,
  getAudienceStats,
  updateNotification,
} from "./notification.service";

export const getAudienceStatsHandler = catchAsync(
  async (_req: AuthRequest, res: Response) => {
    const stats = await getAudienceStats();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Audience stats retrieved successfully",
      data: stats,
    });
  },
);

export const getNotificationsAdmin = catchAsync(
  async (_req: AuthRequest, res: Response) => {
    const notifications = await getAdminNotifications();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Notifications retrieved successfully",
      data: notifications.map(formatNotificationForDashboard),
    });
  },
);

export const getNotificationsApp = catchAsync(
  async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
    }

    const result = await getAppNotifications(
      req.user,
      req.query as Record<string, unknown>,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Notifications retrieved successfully",
      data: result.notifications.map(formatNotificationForDashboard),
      pagination: result.pagination,
    });
  },
);

export const sendNotificationHandler = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { title, message, audience } = req.body;

    const notification = await createNotificationRecord(
      {
        title,
        message,
        audience,
        status: "Sent",
      },
      String(req.user?._id),
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Notification sent successfully",
      data: formatNotificationForDashboard(notification),
    });
  },
);

export const scheduleNotificationHandler = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { title, message, audience, scheduledAt } = req.body;

    if (!scheduledAt) {
      throw new AppError(httpStatus.BAD_REQUEST, "Schedule date is required.");
    }

    const notification = await createNotificationRecord(
      {
        title,
        message,
        audience,
        status: "Scheduled",
        scheduledAt: new Date(scheduledAt),
      },
      String(req.user?._id),
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Notification scheduled successfully",
      data: formatNotificationForDashboard(notification),
    });
  },
);

export const updateNotificationHandler = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const notification = await updateNotification(req.params.id, req.body);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Notification updated successfully",
      data: formatNotificationForDashboard(notification),
    });
  },
);

export const deleteNotificationHandler = catchAsync(
  async (req: AuthRequest, res: Response) => {
    await deleteNotification(req.params.id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Notification deleted successfully",
      data: null,
    });
  },
);
