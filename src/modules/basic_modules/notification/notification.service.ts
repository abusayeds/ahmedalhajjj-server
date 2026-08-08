import httpStatus from "http-status";
import AppError from "../../../errors/AppError";
import queryBuilder from "../../../builder/queryBuilder";
import { IUser } from "../user/user.interface";
import { UserModel } from "../user/user.model";
import {
  INotification,
  NotificationAudience,
  NotificationStatus,
} from "./notification.interface";
import { NotificationModel } from "./notification.model";

const formatSentLabel = (date?: Date) => {
  if (!date) return "—";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

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

const getAudiencesForUser = (user: IUser): NotificationAudience[] => {
  const audiences: NotificationAudience[] = ["All Users"];

  if (user.subscriptionStatus === "trial") {
    audiences.push("Trial Users");
  }

  if (["active", "trial"].includes(user.subscriptionStatus)) {
    if (user.subscriptionType === "VIP") audiences.push("VIP Users");
    if (user.subscriptionType === "Forex") audiences.push("Forex Users");
    if (user.subscriptionType === "Crypto") audiences.push("Crypto Users");
  }

  return [...new Set(audiences)];
};

export const getAppNotifications = async (
  user: IUser,
  query: Record<string, unknown> = {},
) => {
  const audiences = getAudiencesForUser(user);
  const baseFilter = {
    status: "Sent" as NotificationStatus,
    audience: { $in: audiences },
  };

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
  const limit = Number(builderQuery.limit) || 10;
  const pagination = notificationQuery.calculatePagination({
    totalData,
    currentPage,
    limit,
  });

  return { notifications, pagination };
};

export const formatNotificationForDashboard = (notification: INotification) => ({
  id: notification._id,
  _id: notification._id,
  title: notification.title,
  audience: notification.audience,
  sent: formatSentLabel(notification.sentAt || notification.createdAt),
  reach: notification.reach || 0,
  opened: notification.opened || 0,
  status: notification.status,
  message: notification.message,
  scheduledAt: notification.scheduledAt,
});
