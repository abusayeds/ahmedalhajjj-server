import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth";
import { role } from "../../../utils/role";
import {
  createPostHandler,
  deletePostHandler,
  getPostsAdmin,
  getPostsApp,
  publishPostHandler,
  schedulePostHandler,
  updatePostHandler,
} from "./post.controller";

const router = Router();

router.get("/app", authMiddleware(role.user), getPostsApp);

router.get("/", authMiddleware(role.admin), getPostsAdmin);
router.post("/create", authMiddleware(role.admin), createPostHandler);
router.patch("/:id", authMiddleware(role.admin), updatePostHandler);
router.delete("/:id", authMiddleware(role.admin), deletePostHandler);
router.post("/:id/publish", authMiddleware(role.admin), publishPostHandler);
router.post("/:id/schedule", authMiddleware(role.admin), schedulePostHandler);

export const postRoutes = router;
