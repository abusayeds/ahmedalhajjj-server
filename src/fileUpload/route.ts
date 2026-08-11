import express from "express";
import upload from "../middlewares/fileUploadNormal";
import { authMiddleware } from "../middlewares/auth";
import { role } from "../utils/role";
import { uploadFile } from "./upload.controller";

const uploadRouter = express.Router();

uploadRouter.post("/", authMiddleware(role.admin), upload.single("file"), uploadFile);

export default uploadRouter;
