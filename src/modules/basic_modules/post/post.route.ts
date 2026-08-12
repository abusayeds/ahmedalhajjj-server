import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth";
import { role } from "../../../utils/role";
import {
  createPostCommentHandler,
  createPostHandler,
  deletePostCommentHandler,
  deletePostHandler,
  getPostAppComments,
  getPostAppDetail,
  getPostsAdmin,
  getPostsApp,
  publishPostHandler,
  schedulePostHandler,
  sharePostHandler,
  toggleCommentLikeHandler,
  togglePostLikeHandler,
  updatePostCommentHandler,
  updatePostHandler,
} from "./post.controller";

const router = Router();

router.get("/app", authMiddleware(role.user), getPostsApp);
router.get("/app/:id/comments", authMiddleware(role.user), getPostAppComments);
router.post("/app/:id/comments", authMiddleware(role.user), createPostCommentHandler);
router.patch("/app/comments/:commentId", authMiddleware(role.user), updatePostCommentHandler);
router.delete("/app/comments/:commentId", authMiddleware(role.user), deletePostCommentHandler);
router.post("/app/:id/like", authMiddleware(role.user), togglePostLikeHandler);
router.post("/app/:id/share", authMiddleware(role.user), sharePostHandler);
router.get("/app/:id", authMiddleware(role.user), getPostAppDetail);
router.post("/app/comments/:commentId/like", authMiddleware(role.user), toggleCommentLikeHandler);

router.get("/", authMiddleware(role.admin), getPostsAdmin);
router.post("/create", authMiddleware(role.admin), createPostHandler);
router.patch("/:id", authMiddleware(role.admin), updatePostHandler);
router.delete("/:id", authMiddleware(role.admin), deletePostHandler);
router.post("/:id/publish", authMiddleware(role.admin), publishPostHandler);
router.post("/:id/schedule", authMiddleware(role.admin), schedulePostHandler);

export const postRoutes = router;
