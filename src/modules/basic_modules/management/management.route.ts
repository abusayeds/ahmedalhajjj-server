import express from "express";

import { managementController } from "./management.controller";

const router = express.Router();
router.post("/create", managementController.createManagement);
router.get("/:type", managementController.getManagement);
export const managementRoutes = router;
