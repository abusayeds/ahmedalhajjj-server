import { INotification } from "./notification.interface";

export const getRelativeTime = (date?: Date) => {
  if (!date) return "Recently";
  const diffMs = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const inferCategory = (title: string) => {
  const value = title.toLowerCase();
  if (value.includes("signal")) return "Signal";
  if (value.includes("trial")) return "Trial";
  if (value.includes("market") || value.includes("outlook")) return "Market";
  if (value.includes("post") || value.includes("news")) return "News";
  return "General";
};

export const formatNotificationForApp = (
  notification: INotification,
  options: { isRead?: boolean } = {},
) => {
  const sentAt = notification.sentAt || notification.createdAt;

  return {
    id: notification._id,
    title: notification.title,
    message: notification.message,
    audience: notification.audience,
    category: inferCategory(notification.title),
    status: notification.status,
    sentAt,
    timeAgo: getRelativeTime(sentAt),
    sentLabel: sentAt
      ? sentAt.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—",
    isRead: Boolean(options.isRead),
  };
};

export const formatNotificationForDashboard = (notification: INotification) => ({
  id: notification._id,
  _id: notification._id,
  title: notification.title,
  audience: notification.audience,
  sent: notification.sentAt || notification.createdAt
    ? (notification.sentAt || notification.createdAt)!.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—",
  reach: notification.reach || 0,
  opened: notification.opened || 0,
  status: notification.status,
  message: notification.message,
  scheduledAt: notification.scheduledAt,
});
