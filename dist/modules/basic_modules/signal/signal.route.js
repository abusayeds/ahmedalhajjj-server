"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signalRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../../../middlewares/auth");
const role_1 = require("../../../utils/role");
const signal_controller_1 = require("./signal.controller");
const signalType_controller_1 = require("./signalType.controller");
const router = (0, express_1.Router)();
// Mobile app routes
router.get("/app/market-hours", (0, auth_1.authMiddleware)(role_1.role.user), signal_controller_1.getMarketHoursHandler);
router.get("/app", (0, auth_1.authMiddleware)(role_1.role.user), signal_controller_1.getSignalsApp);
// Admin dashboard routes
router.get("/types", (0, auth_1.authMiddleware)(role_1.role.admin), signalType_controller_1.getSignalTypesHandler);
router.post("/types", (0, auth_1.authMiddleware)(role_1.role.admin), signalType_controller_1.createSignalTypeHandler);
router.patch("/types/:id", (0, auth_1.authMiddleware)(role_1.role.admin), signalType_controller_1.updateSignalTypeHandler);
router.delete("/types/:id", (0, auth_1.authMiddleware)(role_1.role.admin), signalType_controller_1.deleteSignalTypeHandler);
router.get("/", (0, auth_1.authMiddleware)(role_1.role.admin), signal_controller_1.getSignalsAdmin);
router.post("/create", (0, auth_1.authMiddleware)(role_1.role.admin), signal_controller_1.createSignalHandler);
router.patch("/:id", (0, auth_1.authMiddleware)(role_1.role.admin), signal_controller_1.updateSignalHandler);
router.delete("/:id", (0, auth_1.authMiddleware)(role_1.role.admin), signal_controller_1.deleteSignalHandler);
router.post("/:id/publish", (0, auth_1.authMiddleware)(role_1.role.admin), signal_controller_1.publishSignalHandler);
router.post("/:id/close", (0, auth_1.authMiddleware)(role_1.role.admin), signal_controller_1.closeSignalHandler);
router.post("/:id/archive", (0, auth_1.authMiddleware)(role_1.role.admin), signal_controller_1.archiveSignalHandler);
router.post("/:id/duplicate", (0, auth_1.authMiddleware)(role_1.role.admin), signal_controller_1.duplicateSignalHandler);
exports.signalRoutes = router;
