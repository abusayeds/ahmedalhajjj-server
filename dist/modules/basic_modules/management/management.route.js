"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.managementRoutes = void 0;
const express_1 = __importDefault(require("express"));
const management_controller_1 = require("./management.controller");
const router = express_1.default.Router();
router.post("/create", management_controller_1.managementController.createManagement);
router.get("/:type", management_controller_1.managementController.getManagement);
exports.managementRoutes = router;
