import { Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import AppError from "../../../errors/AppError";
import { AuthRequest } from "../../../middlewares/auth";
import {
  createPost,
  deletePost,
  formatPostForDashboard,
  getAdminPosts,
  getAppPosts,
  publishPost,
  schedulePost,
  updatePost,
} from "./post.service";

export const getPostsAdmin = catchAsync(async (req: AuthRequest, res: Response) => {
  const posts = await getAdminPosts(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Posts retrieved successfully",
    data: posts.map(formatPostForDashboard),
  });
});

export const getPostsApp = catchAsync(async (_req: AuthRequest, res: Response) => {
  const posts = await getAppPosts();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Posts retrieved successfully",
    data: posts.map(formatPostForDashboard),
  });
});

export const createPostHandler = catchAsync(async (req: AuthRequest, res: Response) => {
  const sendPush = req.body.sendPush !== false;
  const payload = { ...req.body };

  if (payload.status === "Published") {
    const draft = await createPost({ ...payload, status: "Draft" }, String(req.user?._id));
    const post = await publishPost(String(draft._id), sendPush);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Post published successfully",
      data: formatPostForDashboard(post),
    });
    return;
  }

  const post = await createPost(payload, String(req.user?._id));
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Post created successfully",
    data: formatPostForDashboard(post),
  });
});

export const updatePostHandler = catchAsync(async (req: AuthRequest, res: Response) => {
  const post = await updatePost(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Post updated successfully",
    data: formatPostForDashboard(post),
  });
});

export const deletePostHandler = catchAsync(async (req: AuthRequest, res: Response) => {
  await deletePost(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Post deleted successfully",
    data: null,
  });
});

export const publishPostHandler = catchAsync(async (req: AuthRequest, res: Response) => {
  const post = await publishPost(req.params.id, req.body?.sendPush !== false);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Post published successfully",
    data: formatPostForDashboard(post),
  });
});

export const schedulePostHandler = catchAsync(async (req: AuthRequest, res: Response) => {
  const { scheduledAt } = req.body;
  if (!scheduledAt) {
    throw new AppError(httpStatus.BAD_REQUEST, "Schedule date is required.");
  }

  const post = await schedulePost(req.params.id, new Date(scheduledAt));
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Post scheduled successfully",
    data: formatPostForDashboard(post),
  });
});
