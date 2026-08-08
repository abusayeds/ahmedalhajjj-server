import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth";
import { role } from "../../../utils/role";
import { getDashboardStatsHandler } from "./dashboard.controller";

const router = Router();

router.get("/stats", authMiddleware(role.admin), getDashboardStatsHandler);

export const dashboardRoutes = router;
