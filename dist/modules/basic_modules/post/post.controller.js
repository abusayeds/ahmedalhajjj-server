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
exports.schedulePostHandler = exports.publishPostHandler = exports.deletePostHandler = exports.updatePostHandler = exports.createPostHandler = exports.getPostsApp = exports.getPostsAdmin = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse"));
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const post_service_1 = require("./post.service");
exports.getPostsAdmin = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const posts = yield (0, post_service_1.getAdminPosts)(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Posts retrieved successfully",
        data: posts.map(post_service_1.formatPostForDashboard),
    });
}));
exports.getPostsApp = (0, catchAsync_1.default)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const posts = yield (0, post_service_1.getAppPosts)();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Posts retrieved successfully",
        data: posts.map(post_service_1.formatPostForDashboard),
    });
}));
exports.createPostHandler = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const sendPush = req.body.sendPush !== false;
    const payload = Object.assign({}, req.body);
    if (payload.status === "Published") {
        const draft = yield (0, post_service_1.createPost)(Object.assign(Object.assign({}, payload), { status: "Draft" }), String((_a = req.user) === null || _a === void 0 ? void 0 : _a._id));
        const post = yield (0, post_service_1.publishPost)(String(draft._id), sendPush);
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.CREATED,
            success: true,
            message: "Post published successfully",
            data: (0, post_service_1.formatPostForDashboard)(post),
        });
        return;
    }
    const post = yield (0, post_service_1.createPost)(payload, String((_b = req.user) === null || _b === void 0 ? void 0 : _b._id));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Post created successfully",
        data: (0, post_service_1.formatPostForDashboard)(post),
    });
}));
exports.updatePostHandler = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const post = yield (0, post_service_1.updatePost)(req.params.id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Post updated successfully",
        data: (0, post_service_1.formatPostForDashboard)(post),
    });
}));
exports.deletePostHandler = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, post_service_1.deletePost)(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Post deleted successfully",
        data: null,
    });
}));
exports.publishPostHandler = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const post = yield (0, post_service_1.publishPost)(req.params.id, ((_a = req.body) === null || _a === void 0 ? void 0 : _a.sendPush) !== false);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Post published successfully",
        data: (0, post_service_1.formatPostForDashboard)(post),
    });
}));
exports.schedulePostHandler = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { scheduledAt } = req.body;
    if (!scheduledAt) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Schedule date is required.");
    }
    const post = yield (0, post_service_1.schedulePost)(req.params.id, new Date(scheduledAt));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Post scheduled successfully",
        data: (0, post_service_1.formatPostForDashboard)(post),
    });
}));
