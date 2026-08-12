import httpStatus from "http-status";
import AppError from "../../../errors/AppError";
import queryBuilder from "../../../builder/queryBuilder";
import { createNotificationRecord } from "../notification/notification.service";
import { IUser } from "../user/user.interface";
import { UserModel } from "../user/user.model";
import { resolveUserAccess } from "../../../utils/subscriptionAccess";
import { IPost } from "./post.interface";
import { PostModel } from "./post.model";
import {
  PostCommentModel,
  PostCommentLikeModel,
  PostLikeModel,
} from "./postComment.model";
import {
  formatCommentForApp,
  formatPostDetailForApp,
  formatPostForApp,
  formatPostForDashboard,
} from "./post.formatter";

export { formatPostForDashboard } from "./post.formatter";

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

const assertPremiumPostAccess = async (user: IUser) => {
  const access = await resolveUserAccess(user);
  if (!access.canViewPremiumContent) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Premium posts are available for active subscribers only.",
    );
  }
  return access;
};

const getPostAuthor = async (post: IPost) => {
  if (!post.createdBy) return null;
  return UserModel.findById(post.createdBy).select("name firstName lastName role image");
};

const getPostLikeMap = async (userId: string, postIds: string[]) => {
  const likes = await PostLikeModel.find({
    userId,
    postId: { $in: postIds },
  }).select("postId");

  return new Set(likes.map((like) => String(like.postId)));
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
  await PostCommentModel.deleteMany({ postId: id });
  await PostLikeModel.deleteMany({ postId: id });
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

export const getAppPosts = async (
  user: IUser,
  query: Record<string, unknown> = {},
) => {
  const access = await assertPremiumPostAccess(user);

  const filter: Record<string, unknown> = { status: "Published" };

  const category = String(query.category || "All").trim();
  if (category && category.toLowerCase() !== "all") {
    filter.category = category;
  }

  const search = String(query.search || query.searchTerm || "").trim();
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { body: { $regex: search, $options: "i" } },
    ];
  }

  const limit = Number(query.limit) || 10;
  const page = Number(query.page) || 1;

  const postQuery = new queryBuilder(PostModel.find(filter), {
    ...query,
    sort: query.sort || "-publishedAt",
    limit,
    page,
  })
    .search(["title", "body"] as Array<keyof IPost>)
    .filter()
    .sort();

  const { totalData } = await postQuery.paginate(PostModel.find(filter));
  const posts = await postQuery.modelQuery.populate(
    "createdBy",
    "name firstName lastName role image",
  );

  const likedMap = await getPostLikeMap(
    String(user._id),
    posts.map((post) => String(post._id)),
  );

  const formattedPosts = await Promise.all(
    posts.map(async (post) =>
      formatPostForApp(post, {
        isLiked: likedMap.has(String(post._id)),
        author: (post.createdBy as IUser) || (await getPostAuthor(post)),
      }),
    ),
  );

  const pagination = postQuery.calculatePagination({
    totalData,
    currentPage: page,
    limit,
  });

  return {
    access,
    posts: formattedPosts,
    pagination,
    totalPosts: totalData,
    message:
      formattedPosts.length === 0
        ? "There have no post yet."
        : "Latest market insights and trading updates.",
  };
};

export const getAppPostById = async (user: IUser, postId: string) => {
  const access = await assertPremiumPostAccess(user);
  const post = await PostModel.findOne({ _id: postId, status: "Published" });
  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, "Post not found.");
  }

  const author = await getPostAuthor(post);
  const isLiked = Boolean(
    await PostLikeModel.findOne({ userId: user._id, postId: post._id }),
  );

  return {
    access,
    post: formatPostDetailForApp(post, { isLiked, author }),
  };
};

export const getAppPostComments = async (
  user: IUser,
  postId: string,
  query: Record<string, unknown> = {},
) => {
  await assertPremiumPostAccess(user);

  const post = await PostModel.findOne({ _id: postId, status: "Published" });
  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, "Post not found.");
  }

  const limit = Number(query.limit) || 20;
  const page = Number(query.page) || 1;
  const skip = (page - 1) * limit;

  const [comments, totalComments] = await Promise.all([
    PostCommentModel.find({ postId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name firstName lastName image"),
    PostCommentModel.countDocuments({ postId }),
  ]);

  const commentIds = comments.map((comment) => String(comment._id));
  const likedComments = await PostCommentLikeModel.find({
    userId: user._id,
    commentId: { $in: commentIds },
  }).select("commentId");
  const likedSet = new Set(likedComments.map((item) => String(item.commentId)));

  return {
    postSummary: {
      id: post._id,
      title: post.title,
      coverImage: post.coverImage || "",
      likesCount: post.likes || 0,
      commentsCount: post.commentsCount || 0,
      publishedLabel: post.publishedAt
        ? post.publishedAt.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "—",
    },
    comments: comments.map((comment) =>
      formatCommentForApp(comment, {
        isLiked: likedSet.has(String(comment._id)),
        currentUserId: String(user._id),
      }),
    ),
    pagination: {
      totalPage: Math.max(1, Math.ceil(totalComments / limit)),
      currentPage: page,
      totalData: totalComments,
      limit,
    },
  };
};

export const createAppPostComment = async (
  user: IUser,
  postId: string,
  text: string,
) => {
  await assertPremiumPostAccess(user);

  const trimmed = text?.trim();
  if (!trimmed) {
    throw new AppError(httpStatus.BAD_REQUEST, "Comment text is required.");
  }

  const post = await PostModel.findOne({ _id: postId, status: "Published" });
  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, "Post not found.");
  }

  const comment = await PostCommentModel.create({
    postId,
    userId: user._id,
    text: trimmed,
  });

  await PostModel.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

  const populated = await PostCommentModel.findById(comment._id).populate(
    "userId",
    "name firstName lastName image",
  );

  return formatCommentForApp(populated!, {
    isLiked: false,
    currentUserId: String(user._id),
  });
};

export const updateAppPostComment = async (
  user: IUser,
  commentId: string,
  text: string,
) => {
  await assertPremiumPostAccess(user);

  const comment = await PostCommentModel.findById(commentId);
  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, "Comment not found.");
  }

  if (String(comment.userId) !== String(user._id)) {
    throw new AppError(httpStatus.FORBIDDEN, "You can only edit your own comments.");
  }

  const trimmed = text?.trim();
  if (!trimmed) {
    throw new AppError(httpStatus.BAD_REQUEST, "Comment text is required.");
  }

  const updated = await PostCommentModel.findByIdAndUpdate(
    commentId,
    { text: trimmed },
    { new: true },
  ).populate("userId", "name firstName lastName image");

  const isLiked = Boolean(
    await PostCommentLikeModel.findOne({ userId: user._id, commentId }),
  );

  return formatCommentForApp(updated!, {
    isLiked,
    currentUserId: String(user._id),
  });
};

export const deleteAppPostComment = async (user: IUser, commentId: string) => {
  await assertPremiumPostAccess(user);

  const comment = await PostCommentModel.findById(commentId);
  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, "Comment not found.");
  }

  if (String(comment.userId) !== String(user._id)) {
    throw new AppError(httpStatus.FORBIDDEN, "You can only delete your own comments.");
  }

  await PostCommentLikeModel.deleteMany({ commentId });
  await PostCommentModel.findByIdAndDelete(commentId);
  await PostModel.findByIdAndUpdate(comment.postId, { $inc: { commentsCount: -1 } });

  const post = await PostModel.findById(comment.postId).select("commentsCount");

  return {
    commentId,
    postId: comment.postId,
    deleted: true,
    commentsCount: Math.max(0, post?.commentsCount || 0),
  };
};

export const toggleAppPostLike = async (user: IUser, postId: string) => {
  await assertPremiumPostAccess(user);

  const post = await PostModel.findOne({ _id: postId, status: "Published" });
  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, "Post not found.");
  }

  const existing = await PostLikeModel.findOne({ userId: user._id, postId });

  if (existing) {
    await PostLikeModel.findOneAndDelete({ userId: user._id, postId });
    await PostModel.findByIdAndUpdate(postId, { $inc: { likes: -1 } });
  } else {
    await PostLikeModel.create({ userId: user._id, postId });
    await PostModel.findByIdAndUpdate(postId, { $inc: { likes: 1 } });
  }

  const updated = await PostModel.findById(postId);
  return {
    postId,
    isLiked: !existing,
    likesCount: Math.max(0, updated?.likes || 0),
  };
};

export const toggleAppCommentLike = async (user: IUser, commentId: string) => {
  await assertPremiumPostAccess(user);

  const comment = await PostCommentModel.findById(commentId);
  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, "Comment not found.");
  }

  const existing = await PostCommentLikeModel.findOne({ userId: user._id, commentId });

  if (existing) {
    await PostCommentLikeModel.findOneAndDelete({ userId: user._id, commentId });
    await PostCommentModel.findByIdAndUpdate(commentId, { $inc: { likes: -1 } });
  } else {
    await PostCommentLikeModel.create({ userId: user._id, commentId });
    await PostCommentModel.findByIdAndUpdate(commentId, { $inc: { likes: 1 } });
  }

  const updated = await PostCommentModel.findById(commentId);
  return {
    commentId,
    isLiked: !existing,
    likesCount: Math.max(0, updated?.likes || 0),
  };
};

export const recordAppPostShare = async (user: IUser, postId: string) => {
  await assertPremiumPostAccess(user);

  const post = await PostModel.findOneAndUpdate(
    { _id: postId, status: "Published" },
    { $inc: { sharesCount: 1 } },
    { new: true },
  );

  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, "Post not found.");
  }

  return {
    postId,
    sharesCount: post.sharesCount || 0,
  };
};
