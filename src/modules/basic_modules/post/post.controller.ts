import { Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import AppError from "../../../errors/AppError";
import { AuthRequest } from "../../../middlewares/auth";
import {
  createPost,
  createAppPostComment,
  deleteAppPostComment,
  deletePost,
  formatPostForDashboard,
  getAdminPosts,
  getAppPostById,
  getAppPostComments,
  getAppPosts,
  publishPost,
  recordAppPostShare,
  schedulePost,
  toggleAppCommentLike,
  toggleAppPostLike,
  updateAppPostComment,
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

export const getPostsApp = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const result = await getAppPosts(req.user, req.query as Record<string, unknown>);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: {
      access: result.access,
      posts: result.posts,
      totalPosts: result.totalPosts,
    },
    pagination: result.pagination,
  });
});

export const getPostAppDetail = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const result = await getAppPostById(req.user, req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Post details retrieved successfully.",
    data: {
      access: result.access,
      post: result.post,
    },
  });
});

export const getPostAppComments = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const result = await getAppPostComments(
    req.user,
    req.params.id,
    req.query as Record<string, unknown>,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Comments retrieved successfully.",
    data: result,
  });
});

export const createPostCommentHandler = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const comment = await createAppPostComment(req.user, req.params.id, req.body.text);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Comment added successfully.",
    data: comment,
  });
});

export const updatePostCommentHandler = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const comment = await updateAppPostComment(req.user, req.params.commentId, req.body.text);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Comment updated successfully.",
    data: comment,
  });
});

export const deletePostCommentHandler = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const data = await deleteAppPostComment(req.user, req.params.commentId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Comment deleted successfully.",
    data,
  });
});

export const togglePostLikeHandler = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const data = await toggleAppPostLike(req.user, req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: data.isLiked ? "Post liked." : "Post unliked.",
    data,
  });
});

export const toggleCommentLikeHandler = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const data = await toggleAppCommentLike(req.user, req.params.commentId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: data.isLiked ? "Comment liked." : "Comment unliked.",
    data,
  });
});

export const sharePostHandler = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const data = await recordAppPostShare(req.user, req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Post share recorded.",
    data,
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
