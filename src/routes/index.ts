import express from "express";
import { UserRoutes } from "../modules/basic_modules/user/user.route";
import { managementRoutes } from "../modules/basic_modules/management/management.route";
const router = express.Router();
router.use("/api/v1/user", UserRoutes);
router.use("/api/v1/management", managementRoutes);

export default router;
