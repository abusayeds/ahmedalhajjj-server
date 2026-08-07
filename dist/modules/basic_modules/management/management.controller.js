"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.managementController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const management_model_1 = require("./management.model");
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse"));
// Sanitize options for description content
const sanitizeOptions = {
    allowedTags: [
        "b",
        "i",
        "em",
        "strong",
        "a",
        "p",
        "br",
        "ul",
        "ol",
        "li",
        "blockquote",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "code",
        "pre",
        "img",
    ],
    allowedAttributes: { a: ["href", "target"], img: ["src", "alt"] },
    allowedIframeHostnames: ["www.youtube.com"],
};
const createManagement = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { description, type } = req.body;
    const validTypes = ["terms", "about", "privacy"];
    if (!validTypes.includes(type)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Invalid type provided. Accepted type: 'terms', 'about', or 'privacy' in body");
    }
    const sanitizedContent = (0, sanitize_html_1.default)(description, sanitizeOptions);
    if (!sanitizedContent) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Description is required!");
    }
    const model = type === "terms" ? management_model_1.TermsModel : type === "about" ? management_model_1.AboutModel : management_model_1.PrivacyModel;
    const result = yield model.updateOne({}, { description: sanitizedContent }, { upsert: true });
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: `${type.charAt(0).toUpperCase() + type.slice(1)} description updated successfully.`,
        data: result,
    });
}));
const getManagement = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { type } = req.params;
    const validTypes = ["terms", "about", "privacy"];
    if (!validTypes.includes(type)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Invalid type provided. Accepted type: 'terms', 'about', or 'privacy'");
    }
    const model = type === "terms" ? management_model_1.TermsModel : type === "about" ? management_model_1.AboutModel : management_model_1.PrivacyModel;
    const result = yield model.findOne({}).lean();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: `${type.charAt(0).toUpperCase() + type.slice(1)} description retrieved successfully.`,
        data: result,
    });
}));
exports.managementController = {
    createManagement,
    getManagement,
};
