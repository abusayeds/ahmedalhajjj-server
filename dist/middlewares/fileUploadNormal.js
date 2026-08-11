"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const fs_1 = __importDefault(require("fs"));
const http_errors_1 = __importDefault(require("http-errors"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const config_1 = require("../config");
const UPLOAD_PATH = config_1.UPLOAD_FOLDER || "public/images";
const MAX_FILE_SIZE = Number(config_1.max_file_size) || 5 * 1024 * 1024;
if (!fs_1.default.existsSync(UPLOAD_PATH)) {
    fs_1.default.mkdirSync(UPLOAD_PATH, { recursive: true });
}
const ALLOWED_FILE_TYPES = [
    ".jpg",
    ".jpeg",
    ".png",
    ".xlsx",
    ".xls",
    ".csv",
    ".pdf",
    ".doc",
    ".docx",
    ".mp3",
    ".wav",
    ".ogg",
    ".mp4",
    ".avi",
    ".mov",
    ".mkv",
    ".webm",
    ".svg",
];
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_PATH);
    },
    filename: function (req, file, cb) {
        const fileName = (0, uuid_1.v4)() + path_1.default.extname(file.originalname);
        cb(null, fileName);
    },
});
const fileFilter = (req, file, cb) => {
    const extName = path_1.default.extname(file.originalname).toLocaleLowerCase();
    const isAllowedFileType = ALLOWED_FILE_TYPES.includes(extName);
    if (!isAllowedFileType) {
        return cb((0, http_errors_1.default)(400, "File type not allowed"));
    }
    cb(null, true);
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
    },
});
exports.default = upload;
