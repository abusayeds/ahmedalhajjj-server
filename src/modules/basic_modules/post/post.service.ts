import httpStatus from "http-status";
import AppError from "../../../errors/AppError";
import { createNotificationRecord } from "../notification/notification.service";
import { IPost } from "./post.interface";
import { PostModel } from "./post.model";

const formatPostDate = (date?: Date) => {
  if (!date) return "—";
  return date.toLocaleString("en-US", { month: "short", day: "numeric" });
};

const normalizePostPayload = (payload: Partial<IPost>) => {
  const data: Partial<IPost> = { ...payload };

  if (payload.status === "Published" && !payload.publishedAt) {
    data.publishedAt = new Date();
  }

  if (payload.status === "Scheduled" && payload.scheduledAt) {
    data.publishedAt = undefined;
  }

  return data;
};

export const getAdminPosts = async (query: Record<string, unknown>) => {
  const filter: Record<string, unknown> = {};

  if (query.status && query.status !== "All") {
    filter.status = query.status;
  }

  if (query.category && query.category !== "All Categories") {
    filter.category = query.category;
  }

  if (query.searchTerm) {
    filter.title = { $regex: String(query.searchTerm), $options: "i" };
  }

  return PostModel.find(filter).sort({ createdAt: -1 });
};

export const createPost = async (payload: Partial<IPost>, adminId?: string) => {
  const data = normalizePostPayload(payload);
  return PostModel.create({ ...data, createdBy: adminId });
};

export const updatePost = async (id: string, payload: Partial<IPost>) => {
  const data = normalizePostPayload(payload);
  const updated = await PostModel.findByIdAndUpdate(id, data, { new: true });
  if (!updated) {
    throw new AppError(httpStatus.NOT_FOUND, "Post not found.");
  }
  return updated;
};

export const deletePost = async (id: string) => {
  const deleted = await PostModel.findByIdAndDelete(id);
  if (!deleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Post not found.");
  }
  return deleted;
};

export const publishPost = async (id: string, sendPush = true) => {
  const post = await updatePost(id, {
    status: "Published",
    publishedAt: new Date(),
  } as Partial<IPost>);

  if (sendPush) {
    await createNotificationRecord({
      title: `New Post — ${post.title}`,
      message: post.body?.slice(0, 160) || post.title,
      audience: "All Users",
      status: "Sent",
    });
  }

  return post;
};

export const schedulePost = async (id: string, scheduledAt: Date) => {
  return updatePost(id, {
    status: "Scheduled",
    scheduledAt,
  } as Partial<IPost>);
};

export const getAppPosts = async () => {
  return PostModel.find({ status: "Published" }).sort({ publishedAt: -1 });
};

export const formatPostForDashboard = (post: IPost) => ({
  id: post._id,
  _id: post._id,
  img: post.coverImage || "",
  title: post.title,
  cat: post.category,
  likes: post.likes || 0,
  comments: post.commentsCount || 0,
  date: formatPostDate(post.publishedAt || post.createdAt),
  status: post.status,
  body: post.body,
  scheduledAt: post.scheduledAt,
});
