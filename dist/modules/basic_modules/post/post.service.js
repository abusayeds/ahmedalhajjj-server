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
exports.formatPostForDashboard = exports.getAppPosts = exports.schedulePost = exports.publishPost = exports.deletePost = exports.updatePost = exports.createPost = exports.getAdminPosts = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const notification_service_1 = require("../notification/notification.service");
const post_model_1 = require("./post.model");
const formatPostDate = (date) => {
    if (!date)
        return "—";
    return date.toLocaleString("en-US", { month: "short", day: "numeric" });
};
const normalizePostPayload = (payload) => {
    const data = Object.assign({}, payload);
    if (payload.status === "Published" && !payload.publishedAt) {
        data.publishedAt = new Date();
    }
    if (payload.status === "Scheduled" && payload.scheduledAt) {
        data.publishedAt = undefined;
    }
    return data;
};
const getAdminPosts = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const filter = {};
    if (query.status && query.status !== "All") {
        filter.status = query.status;
    }
    if (query.category && query.category !== "All Categories") {
        filter.category = query.category;
    }
    if (query.searchTerm) {
        filter.title = { $regex: String(query.searchTerm), $options: "i" };
    }
    return post_model_1.PostModel.find(filter).sort({ createdAt: -1 });
});
exports.getAdminPosts = getAdminPosts;
const createPost = (payload, adminId) => __awaiter(void 0, void 0, void 0, function* () {
    const data = normalizePostPayload(payload);
    return post_model_1.PostModel.create(Object.assign(Object.assign({}, data), { createdBy: adminId }));
});
exports.createPost = createPost;
const updatePost = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const data = normalizePostPayload(payload);
    const updated = yield post_model_1.PostModel.findByIdAndUpdate(id, data, { new: true });
    if (!updated) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Post not found.");
    }
    return updated;
});
exports.updatePost = updatePost;
const deletePost = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const deleted = yield post_model_1.PostModel.findByIdAndDelete(id);
    if (!deleted) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Post not found.");
    }
    return deleted;
});
exports.deletePost = deletePost;
const publishPost = (id_1, ...args_1) => __awaiter(void 0, [id_1, ...args_1], void 0, function* (id, sendPush = true) {
    var _a;
    const post = yield (0, exports.updatePost)(id, {
        status: "Published",
        publishedAt: new Date(),
    });
    if (sendPush) {
        yield (0, notification_service_1.createNotificationRecord)({
            title: `New Post — ${post.title}`,
            message: ((_a = post.body) === null || _a === void 0 ? void 0 : _a.slice(0, 160)) || post.title,
            audience: "All Users",
            status: "Sent",
        });
    }
    return post;
});
exports.publishPost = publishPost;
const schedulePost = (id, scheduledAt) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, exports.updatePost)(id, {
        status: "Scheduled",
        scheduledAt,
    });
});
exports.schedulePost = schedulePost;
const getAppPosts = () => __awaiter(void 0, void 0, void 0, function* () {
    return post_model_1.PostModel.find({ status: "Published" }).sort({ publishedAt: -1 });
});
exports.getAppPosts = getAppPosts;
const formatPostForDashboard = (post) => ({
    id: post._id,
    _id: post._id,
    img: post.coverImage || "",
    title: post.title,
    cat: post.category,
    likes: post.likes || 0,
    comments: post.commentsCount || 0,
    date: formatPostDate(post.publishedAt || post.createdAt),
    status: post.status,
    body: post.body,
    scheduledAt: post.scheduledAt,
});
exports.formatPostForDashboard = formatPostForDashboard;
