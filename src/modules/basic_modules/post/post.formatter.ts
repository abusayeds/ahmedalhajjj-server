import { IPost, IPostComment } from "./post.interface";
import { IUser } from "../user/user.interface";

const BRAND_AUTHOR = {
  name: "Elite Trading",
  username: "Elite Trading",
  avatarUrl: "",
  initials: "ET",
  isVerified: true,
};

export const getRelativeTime = (date?: Date) => {
  if (!date) return "Recently";
  const diffMs = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const buildAuthor = (user?: IUser | null) => {
  if (!user) return BRAND_AUTHOR;

  const name = user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Elite Trading";
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return {
    name,
    username: name,
    avatarUrl: user.image?.publicFileURL || "",
    initials,
    isVerified: user.role === "admin",
  };
};

const buildExcerpt = (body: string, max = 160) => {
  const clean = body.replace(/\[DEMO\]|\[SEED\]/g, "").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).trim()}...`;
};

export const formatPostForApp = (
  post: IPost,
  options: {
    isLiked?: boolean;
    author?: IUser | null;
  } = {},
) => {
  const publishedAt = post.publishedAt || post.createdAt;

  return {
    id: post._id,
    title: post.title,
    body: post.body,
    excerpt: buildExcerpt(post.body || post.title),
    category: post.category,
    categoryLabel: post.category,
    coverImage: post.coverImage || "",
    author: buildAuthor(options.author),
    publishedAt,
    publishedLabel: publishedAt
      ? publishedAt.toLocaleString("en-US", { month: "short", day: "numeric" })
      : "—",
    timeAgo: getRelativeTime(publishedAt),
    likesCount: post.likes || 0,
    commentsCount: post.commentsCount || 0,
    sharesCount: post.sharesCount || 0,
    isLikedByMe: Boolean(options.isLiked),
  };
};

export const formatPostDetailForApp = (
  post: IPost,
  options: {
    isLiked?: boolean;
    author?: IUser | null;
  } = {},
) => ({
  ...formatPostForApp(post, options),
  status: post.status,
});

export const formatCommentForApp = (
  comment: IPostComment & { userId?: IUser | string },
  options: { isLiked?: boolean; currentUserId?: string } = {},
) => {
  const user =
    comment.userId && typeof comment.userId === "object" && "email" in comment.userId
      ? (comment.userId as IUser)
      : null;

  const name = user
    ? user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User"
    : "User";

  const ownerId = String(user?._id || comment.userId || "");
  const isOwner = Boolean(options.currentUserId && ownerId === String(options.currentUserId));

  return {
    id: comment._id,
    postId: comment.postId,
    text: comment.text,
    likesCount: comment.likes || 0,
    isLikedByMe: Boolean(options.isLiked),
    isOwner,
    canEdit: isOwner,
    canDelete: isOwner,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    timeAgo: getRelativeTime(comment.createdAt),
    user: {
      id: user?._id || comment.userId,
      name,
      username: name,
      avatarUrl: user?.image?.publicFileURL || "",
      initials: name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    },
  };
};

export const formatPostForDashboard = (post: IPost) => ({
  id: post._id,
  _id: post._id,
  img: post.coverImage || "",
  title: post.title,
  cat: post.category,
  likes: post.likes || 0,
  comments: post.commentsCount || 0,
  shares: post.sharesCount || 0,
  date: post.publishedAt || post.createdAt
    ? new Date(post.publishedAt || post.createdAt!).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "—",
  status: post.status,
  body: post.body,
  scheduledAt: post.scheduledAt,
});
