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
  getAppUnreadNotificationCount,
  getAudienceStats,
  markAllAppNotificationsRead,
  markAppNotificationRead,
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
      message: result.message,
      data: {
        notifications: result.notifications,
        unreadCount: result.unreadCount,
        totalNotifications: result.totalNotifications,
      },
      pagination: result.pagination,
    });
  },
);

export const getUnreadNotificationCountHandler = catchAsync(
  async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
    }

    const data = await getAppUnreadNotificationCount(req.user);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Unread notification count retrieved.",
      data,
    });
  },
);

export const markNotificationReadHandler = catchAsync(
  async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
    }

    const data = await markAppNotificationRead(req.user, req.params.notificationId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Notification marked as read.",
      data,
    });
  },
);

export const markAllNotificationsReadHandler = catchAsync(
  async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
    }

    const data = await markAllAppNotificationsRead(req.user);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "All notifications marked as read ",
      data,
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
