import httpStatus from "http-status";
import AppError from "../../../errors/AppError";
import queryBuilder from "../../../builder/queryBuilder";
import { resolveUserAccess } from "../../../utils/subscriptionAccess";
import { IUser } from "../user/user.interface";
import { UserModel } from "../user/user.model";
import {
  INotification,
  NotificationAudience,
  NotificationStatus,
} from "./notification.interface";
import { NotificationModel } from "./notification.model";
import { NotificationReadModel } from "./notificationRead.model";
import {
  formatNotificationForApp,
  formatNotificationForDashboard,
} from "./notification.formatter";

export { formatNotificationForDashboard } from "./notification.formatter";

const baseUserFilter = {
  role: "user",
  isDeleted: false,
  status: { $ne: "blocked" },
};

export const getAudienceStats = async () => {
  const [all, vip, forex, crypto, trial] = await Promise.all([
    UserModel.countDocuments(baseUserFilter),
    UserModel.countDocuments({
      ...baseUserFilter,
      subscriptionType: "VIP",
      subscriptionStatus: { $in: ["active", "trial"] },
    }),
    UserModel.countDocuments({
      ...baseUserFilter,
      subscriptionType: "Forex",
      subscriptionStatus: { $in: ["active", "trial"] },
    }),
    UserModel.countDocuments({
      ...baseUserFilter,
      subscriptionType: "Crypto",
      subscriptionStatus: { $in: ["active", "trial"] },
    }),
    UserModel.countDocuments({
      ...baseUserFilter,
      subscriptionStatus: "trial",
    }),
  ]);

  return { all, vip, forex, crypto, trial };
};

export const getReachForAudience = async (audience: NotificationAudience) => {
  const stats = await getAudienceStats();

  switch (audience) {
    case "VIP Users":
      return stats.vip;
    case "Forex Users":
      return stats.forex;
    case "Crypto Users":
      return stats.crypto;
    case "Trial Users":
      return stats.trial;
    default:
      return stats.all;
  }
};

export const createNotificationRecord = async (
  payload: {
    title: string;
    message: string;
    audience: NotificationAudience;
    status?: NotificationStatus;
    scheduledAt?: Date;
  },
  adminId?: string,
) => {
  const status = payload.status || "Sent";
  const reach =
    status === "Sent" ? await getReachForAudience(payload.audience) : 0;

  return NotificationModel.create({
    title: payload.title,
    message: payload.message,
    audience: payload.audience,
    status,
    reach,
    opened: 0,
    scheduledAt: payload.scheduledAt,
    sentAt: status === "Sent" ? new Date() : undefined,
    createdBy: adminId,
  });
};

export const getAdminNotifications = async () => {
  return NotificationModel.find().sort({ createdAt: -1 });
};

export const updateNotification = async (
  id: string,
  payload: Partial<INotification>,
) => {
  const updated = await NotificationModel.findByIdAndUpdate(id, payload, {
    new: true,
  });
  if (!updated) {
    throw new AppError(httpStatus.NOT_FOUND, "Notification not found.");
  }
  return updated;
};

export const deleteNotification = async (id: string) => {
  const deleted = await NotificationModel.findByIdAndDelete(id);
  if (!deleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Notification not found.");
  }
  return deleted;
};

const getAudiencesForUser = async (user: IUser): Promise<NotificationAudience[]> => {
  const audiences: NotificationAudience[] = ["All Users"];
  const access = await resolveUserAccess(user);

  if (access.hasActiveAccess) {
    if (access.accessType === "trial" || access.accessType === "promo") {
      audiences.push("Trial Users");
    }

    if (access.plan === "VIP") audiences.push("VIP Users");
    if (access.plan === "Forex") audiences.push("Forex Users");
    if (access.plan === "Crypto") audiences.push("Crypto Users");
  } else if (user.subscriptionStatus === "trial") {
    audiences.push("Trial Users");
  }

  if (user.subscriptionType === "VIP") audiences.push("VIP Users");
  if (user.subscriptionType === "Forex") audiences.push("Forex Users");
  if (user.subscriptionType === "Crypto") audiences.push("Crypto Users");

  return [...new Set(audiences)];
};

const buildAppNotificationFilter = async (user: IUser) => {
  const audiences = await getAudiencesForUser(user);
  return {
    status: "Sent" as NotificationStatus,
    audience: { $in: audiences },
  };
};

const getReadNotificationIds = async (userId: string, notificationIds: string[]) => {
  if (!notificationIds.length) {
    return new Set<string>();
  }

  const reads = await NotificationReadModel.find({
    userId,
    notificationId: { $in: notificationIds },
  }).select("notificationId");

  return new Set(reads.map((item) => String(item.notificationId)));
};

export const getAppUnreadNotificationCount = async (user: IUser) => {
  const baseFilter = await buildAppNotificationFilter(user);
  const notificationIds = await NotificationModel.find(baseFilter).select("_id");
  const allIds = notificationIds.map((item) => String(item._id));

  if (!allIds.length) {
    return { unreadCount: 0, totalCount: 0 };
  }

  const readCount = await NotificationReadModel.countDocuments({
    userId: user._id,
    notificationId: { $in: allIds },
  });

  const totalCount = allIds.length;
  return {
    unreadCount: Math.max(0, totalCount - readCount),
    totalCount,
  };
};

export const getAppNotifications = async (
  user: IUser,
  query: Record<string, unknown> = {},
) => {
  const baseFilter = await buildAppNotificationFilter(user);

  const builderQuery: Record<string, unknown> = { ...query };
  if (!builderQuery.sort) {
    builderQuery.sort = "-sentAt";
  }

  const notificationQuery = new queryBuilder(
    NotificationModel.find(baseFilter),
    builderQuery,
  )
    .search(["title", "message"] as Array<keyof INotification>)
    .filter()
    .sort();

  const { totalData } = await notificationQuery.paginate(
    NotificationModel.find(baseFilter),
  );
  const notifications = await notificationQuery.modelQuery.exec();
  const currentPage = Number(builderQuery.page) || 1;
  const limit = Number(builderQuery.limit) || 20;
  const pagination = notificationQuery.calculatePagination({
    totalData,
    currentPage,
    limit,
  });

  const notificationIds = notifications.map((item) => String(item._id));
  const readSet = await getReadNotificationIds(String(user._id), notificationIds);
  const unreadStats = await getAppUnreadNotificationCount(user);

  return {
    notifications: notifications.map((notification) =>
      formatNotificationForApp(notification, {
        isRead: readSet.has(String(notification._id)),
      }),
    ),
    unreadCount: unreadStats.unreadCount,
    totalNotifications: totalData,
    pagination,
    message:
      notifications.length === 0
        ? "No notifications yet."
        : "Your latest alerts and updates.",
  };
};

export const markAppNotificationRead = async (user: IUser, notificationId: string) => {
  const baseFilter = await buildAppNotificationFilter(user);
  const notification = await NotificationModel.findOne({
    _id: notificationId,
    ...baseFilter,
  });

  if (!notification) {
    throw new AppError(httpStatus.NOT_FOUND, "Notification not found.");
  }

  const existing = await NotificationReadModel.findOne({
    userId: user._id,
    notificationId,
  });

  if (!existing) {
    await NotificationReadModel.create({
      userId: user._id,
      notificationId,
      readAt: new Date(),
    });
    await NotificationModel.findByIdAndUpdate(notificationId, { $inc: { opened: 1 } });
  }

  const unreadStats = await getAppUnreadNotificationCount(user);

  return {
    notificationId,
    isRead: true,
    notification: formatNotificationForApp(notification, { isRead: true }),
    unreadCount: unreadStats.unreadCount,
  };
};

export const markAllAppNotificationsRead = async (user: IUser) => {
  const baseFilter = await buildAppNotificationFilter(user);
  const notifications = await NotificationModel.find(baseFilter).select("_id");
  const notificationIds = notifications.map((item) => String(item._id));

  if (!notificationIds.length) {
    return { markedCount: 0, unreadCount: 0 };
  }

  const alreadyRead = await NotificationReadModel.find({
    userId: user._id,
    notificationId: { $in: notificationIds },
  }).select("notificationId");
  const readSet = new Set(alreadyRead.map((item) => String(item.notificationId)));

  const unreadIds = notificationIds.filter((id) => !readSet.has(id));

  if (unreadIds.length) {
    await Promise.all(
      unreadIds.map(async (notificationId) => {
        try {
          await NotificationReadModel.create({
            userId: user._id,
            notificationId,
            readAt: new Date(),
          });
        } catch (error: unknown) {
          const mongoError = error as { code?: number };
          if (mongoError?.code !== 11000) {
            throw error;
          }
        }
      }),
    );

    await NotificationModel.updateMany(
      { _id: { $in: unreadIds } },
      { $inc: { opened: 1 } },
    );
  }

  return {
    markedCount: unreadIds.length,
    unreadCount: 0,
  };
};
