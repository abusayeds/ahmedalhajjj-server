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
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedPosts = void 0;
const user_model_1 = require("../user/user.model");
const post_model_1 = require("./post.model");
const SEED_MARKER = "[SEED]";
const dayAt = (offsetDays, hour = 10, minute = 0) => {
    const d = new Date();
    d.setHours(hour, minute, 0, 0);
    d.setDate(d.getDate() + offsetDays);
    return d;
};
const seedPosts = () => __awaiter(void 0, void 0, void 0, function* () {
    const admin = yield user_model_1.UserModel.findOne({ role: "admin" }).select("_id");
    const adminId = admin === null || admin === void 0 ? void 0 : admin._id;
    yield post_model_1.PostModel.deleteMany({ body: { $regex: SEED_MARKER } });
    const posts = [
        {
            title: "Bitcoin Reclaims Key $67K Level",
            body: `${SEED_MARKER} Bitcoin has reclaimed the key $67,000 level after a period of consolidation. Strong volume on the breakout suggests bullish momentum may continue toward the next resistance zone near $69,500. Traders should watch the $65,800 support for any pullbacks.`,
            category: "Market Update",
            coverImage: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&h=480&fit=crop&auto=format",
            likes: 142,
            commentsCount: 28,
            status: "Published",
            publishedAt: dayAt(-1, 9, 15),
            createdBy: adminId,
        },
        {
            title: "Understanding Risk-to-Reward Ratios",
            body: `${SEED_MARKER} One of the most important concepts in trading is the risk-to-reward ratio. A 1:2 R:R means you risk $100 to target $200. Consistently applying this rule helps protect capital during losing streaks and compound gains over time.`,
            category: "Education",
            coverImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=480&fit=crop&auto=format",
            likes: 89,
            commentsCount: 14,
            status: "Published",
            publishedAt: dayAt(-2, 11, 30),
            createdBy: adminId,
        },
        {
            title: "Fed Signals No Rate Cuts Before Q4",
            body: `${SEED_MARKER} The Federal Reserve has indicated that rate cuts are unlikely before Q4, citing persistent inflation concerns. Forex and gold traders should expect increased volatility around major US economic releases this week.`,
            category: "News",
            coverImage: "https://images.unsplash.com/photo-1591033594798-33227a05780d?w=1200&h=480&fit=crop&auto=format",
            likes: 67,
            commentsCount: 19,
            status: "Published",
            publishedAt: dayAt(-3, 14, 0),
            createdBy: adminId,
        },
        {
            title: "Premium Signal Alerts — Now Live",
            body: `${SEED_MARKER} Premium Signal Alerts are now live in the mobile app. Subscribers receive real-time push notifications for every new signal, including entry, stop-loss, and take-profit levels across Forex and Crypto markets.`,
            category: "Announcement",
            coverImage: "https://images.unsplash.com/photo-1605792657660-596af9009e82?w=1200&h=480&fit=crop&auto=format",
            likes: 203,
            commentsCount: 41,
            status: "Published",
            publishedAt: dayAt(0, 8, 45),
            createdBy: adminId,
        },
    ];
    yield post_model_1.PostModel.insertMany(posts);
    console.log(`✓ ${posts.length} posts seeded successfully`);
});
exports.seedPosts = seedPosts;
