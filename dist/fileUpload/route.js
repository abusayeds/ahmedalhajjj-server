"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fileUploadNormal_1 = __importDefault(require("../middlewares/fileUploadNormal"));
const auth_1 = require("../middlewares/auth");
const role_1 = require("../utils/role");
const upload_controller_1 = require("./upload.controller");
const uploadRouter = express_1.default.Router();
uploadRouter.post("/", (0, auth_1.authMiddleware)(role_1.role.admin), fileUploadNormal_1.default.single("file"), upload_controller_1.uploadFile);
exports.default = uploadRouter;
