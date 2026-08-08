import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth";
import { role } from "../../../utils/role";
import {
  archiveSignalHandler,
  closeSignalHandler,
  createSignalHandler,
  deleteSignalHandler,
  duplicateSignalHandler,
  getMarketHoursHandler,
  getSignalsAdmin,
  getSignalsApp,
  publishSignalHandler,
  updateSignalHandler,
} from "./signal.controller";
import {
  createSignalTypeHandler,
  deleteSignalTypeHandler,
  getSignalTypesHandler,
  updateSignalTypeHandler,
} from "./signalType.controller";

const router = Router();

// Mobile app routes
router.get("/app/market-hours", authMiddleware(role.user), getMarketHoursHandler);
router.get("/app", authMiddleware(role.user), getSignalsApp);

// Admin dashboard routes
router.get("/types", authMiddleware(role.admin), getSignalTypesHandler);
router.post("/types", authMiddleware(role.admin), createSignalTypeHandler);
router.patch("/types/:id", authMiddleware(role.admin), updateSignalTypeHandler);
router.delete("/types/:id", authMiddleware(role.admin), deleteSignalTypeHandler);
router.get("/", authMiddleware(role.admin), getSignalsAdmin);
router.post("/create", authMiddleware(role.admin), createSignalHandler);
router.patch("/:id", authMiddleware(role.admin), updateSignalHandler);
router.delete("/:id", authMiddleware(role.admin), deleteSignalHandler);
router.post("/:id/publish", authMiddleware(role.admin), publishSignalHandler);
router.post("/:id/close", authMiddleware(role.admin), closeSignalHandler);
router.post("/:id/archive", authMiddleware(role.admin), archiveSignalHandler);
router.post("/:id/duplicate", authMiddleware(role.admin), duplicateSignalHandler);

export const signalRoutes = router;
