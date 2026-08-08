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
exports.getDashboardStats = void 0;
const subscription_model_1 = require("../subscription/subscription.model");
const subscription_service_1 = require("../subscription/subscription.service");
const signal_model_1 = require("../signal/signal.model");
const post_model_1 = require("../post/post.model");
const notification_model_1 = require("../notification/notification.model");
const user_model_1 = require("../user/user.model");
const coupon_model_1 = require("../coupon/coupon.model");
const COLORS = {
    buy: "#00D084",
    sell: "#FF5A6B",
    brand: "#8000FF",
    gold: "#BFA06D",
    muted: "#64748B",
};
const formatMonth = (date) => date.toLocaleString("en-US", { month: "short" });
const getRelativeTime = (date) => {
    if (!date)
        return "Recently";
    const diffMs = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1)
        return "Just now";
    if (mins < 60)
        return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24)
        return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};
const calcChange = (current, previous) => {
    if (previous === 0) {
        return current > 0 ? "+100%" : "0%";
    }
    const pct = ((current - previous) / previous) * 100;
    return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
};
const getMonthRanges = (months) => {
    const ranges = [];
    const now = new Date();
    for (let i = months - 1; i >= 0; i -= 1) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
        ranges.push({ start, end, label: formatMonth(start) });
    }
    return ranges;
};
const countActivePlanAt = (plan, end) => __awaiter(void 0, void 0, void 0, function* () {
    return subscription_model_1.PurchaseModel.countDocuments({
        subscriptionName: plan,
        paymentStatus: "completed",
        startDate: { $lte: end },
        endDate: { $gte: end },
    });
});
const buildSparkline = (values) => values.map((v) => ({ v }));
const getGrowthData = (months) => __awaiter(void 0, void 0, void 0, function* () {
    const ranges = getMonthRanges(months);
    const growthData = [];
    for (const range of ranges) {
        const [vip, forex, crypto] = yield Promise.all([
            countActivePlanAt("VIP", range.end),
            countActivePlanAt("Forex", range.end),
            countActivePlanAt("Crypto", range.end),
        ]);
        growthData.push({
            m: range.label,
            v: vip,
            f: forex,
            c: crypto,
        });
    }
    return growthData;
});
const getRevenueData = (months) => __awaiter(void 0, void 0, void 0, function* () {
    const ranges = getMonthRanges(months);
    const revenueData = [];
    for (const range of ranges) {
        const purchases = yield subscription_model_1.PurchaseModel.find({
            paymentStatus: "completed",
            createdAt: { $gte: range.start, $lte: range.end },
        }).select("amount");
        const total = purchases.reduce((sum, item) => sum + (item.amount || 0), 0);
        revenueData.push({ m: range.label, r: Math.round(total) });
    }
    return revenueData;
});
const getSignalPerformance = () => __awaiter(void 0, void 0, void 0, function* () {
    const closedSignals = yield signal_model_1.SignalModel.find({ status: "Closed" }).select("closeResult");
    const totalClosed = closedSignals.length;
    const win = closedSignals.filter((s) => s.closeResult === "Win").length;
    const loss = closedSignals.filter((s) => s.closeResult === "Loss").length;
    const breakeven = closedSignals.filter((s) => s.closeResult === "Breakeven").length;
    const counted = win + loss + breakeven;
    const toPercent = (value) => counted > 0 ? Math.round((value / counted) * 100) : 0;
    const winRate = toPercent(win);
    return {
        totalClosed,
        winRate,
        perfData: [
            { n: "Win", v: toPercent(win), color: COLORS.buy },
            { n: "Loss", v: toPercent(loss), color: COLORS.sell },
            { n: "BE", v: toPercent(breakeven), color: COLORS.muted },
        ],
    };
});
const getMarketTickers = () => __awaiter(void 0, void 0, void 0, function* () {
    const configs = [
        { s: "BTC", pattern: /BTC/i },
        { s: "GOLD", pattern: /GOLD|XAU/i },
        { s: "NAS100", pattern: /NAS100|NAS/i },
    ];
    const tickers = [];
    for (const config of configs) {
        const signal = yield signal_model_1.SignalModel.findOne({
            asset: config.pattern,
            status: { $in: ["Active", "Closed"] },
        }).sort({ publishedAt: -1, createdAt: -1 });
        if (!signal)
            continue;
        tickers.push({
            s: config.s,
            p: signal.entry,
            c: signal.closePnl
                ? signal.closePnl.startsWith("-")
                    ? signal.closePnl
                    : `+${signal.closePnl.replace("+", "")}`
                : signal.direction === "BUY"
                    ? "Long"
                    : "Short",
            up: signal.direction === "BUY",
        });
    }
    return tickers;
});
const getActivityFeed = () => __awaiter(void 0, void 0, void 0, function* () {
    const [purchases, signals, posts, notifications, trialUsers, coupons] = yield Promise.all([
        subscription_model_1.PurchaseModel.find({ paymentStatus: "completed" })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("userId", "firstName lastName name email"),
        signal_model_1.SignalModel.find({ status: { $in: ["Active", "Closed"] } })
            .sort({ publishedAt: -1, createdAt: -1 })
            .limit(5),
        post_model_1.PostModel.find({ status: "Published" }).sort({ publishedAt: -1 }).limit(5),
        notification_model_1.NotificationModel.find({ status: "Sent" }).sort({ sentAt: -1 }).limit(5),
        user_model_1.UserModel.find({
            role: "user",
            isDeleted: false,
            subscriptionStatus: "trial",
        })
            .sort({ createdAt: -1 })
            .limit(5)
            .select("firstName lastName name email createdAt"),
        coupon_model_1.CouponModel.find({ used: { $gt: 0 } }).sort({ updatedAt: -1 }).limit(5),
    ]);
    const activities = [];
    purchases.forEach((purchase) => {
        const user = purchase.userId;
        const name = (user === null || user === void 0 ? void 0 : user.name) ||
            [user === null || user === void 0 ? void 0 : user.firstName, user === null || user === void 0 ? void 0 : user.lastName].filter(Boolean).join(" ") ||
            (user === null || user === void 0 ? void 0 : user.email) ||
            "User";
        activities.push({
            icon: "💳",
            text: `${name} purchased ${purchase.subscriptionName} Plan`,
            time: getRelativeTime(purchase.createdAt),
            col: COLORS.gold,
            at: new Date(purchase.createdAt || 0).getTime(),
        });
    });
    signals.forEach((signal) => {
        activities.push({
            icon: "⚡",
            text: `New signal published — ${signal.asset} ${signal.direction}`,
            time: getRelativeTime(signal.publishedAt || signal.createdAt),
            col: COLORS.buy,
            at: new Date(signal.publishedAt || signal.createdAt || 0).getTime(),
        });
    });
    posts.forEach((post) => {
        activities.push({
            icon: "📰",
            text: `Post published — ${post.title}`,
            time: getRelativeTime(post.publishedAt || post.createdAt),
            col: "#B57AFF",
            at: new Date(post.publishedAt || post.createdAt || 0).getTime(),
        });
    });
    notifications.forEach((notification) => {
        activities.push({
            icon: "🔔",
            text: `Notification sent — ${notification.title}`,
            time: getRelativeTime(notification.sentAt || notification.createdAt),
            col: COLORS.brand,
            at: new Date(notification.sentAt || notification.createdAt || 0).getTime(),
        });
    });
    trialUsers.forEach((user) => {
        const name = user.name ||
            [user.firstName, user.lastName].filter(Boolean).join(" ") ||
            user.email;
        activities.push({
            icon: "🆓",
            text: `${name} started Free Trial`,
            time: getRelativeTime(user.createdAt),
            col: COLORS.brand,
            at: new Date(user.createdAt || 0).getTime(),
        });
    });
    coupons.forEach((coupon) => {
        activities.push({
            icon: "🎟",
            text: `Coupon ${coupon.code} has ${coupon.used} redemption${coupon.used === 1 ? "" : "s"}`,
            time: getRelativeTime(coupon.updatedAt),
            col: COLORS.gold,
            at: new Date(coupon.updatedAt || 0).getTime(),
        });
    });
    return activities
        .sort((a, b) => b.at - a.at)
        .slice(0, 6)
        .map(({ icon, text, time, col }) => ({ icon, text, time, col }));
});
const getDashboardStats = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (range = "6M") {
    var _a, _b;
    const months = range === "7D" ? 1 : range === "30D" ? 2 : 6;
    const subscriptionStats = yield (0, subscription_service_1.getSubscriptionStats)();
    const growthData = yield getGrowthData(months);
    const revenueData = yield getRevenueData(months);
    const signalPerformance = yield getSignalPerformance();
    const marketTickers = yield getMarketTickers();
    const activityFeed = yield getActivityFeed();
    const currentMonthRevenue = ((_a = revenueData[revenueData.length - 1]) === null || _a === void 0 ? void 0 : _a.r) || 0;
    const previousMonthRevenue = ((_b = revenueData[revenueData.length - 2]) === null || _b === void 0 ? void 0 : _b.r) || 0;
    const currentGrowth = growthData[growthData.length - 1] || { v: 0, f: 0, c: 0 };
    const previousGrowth = growthData[growthData.length - 2] || { v: 0, f: 0, c: 0 };
    const vipSpark = buildSparkline(growthData.map((item) => item.v));
    const forexSpark = buildSparkline(growthData.map((item) => item.f));
    const cryptoSpark = buildSparkline(growthData.map((item) => item.c));
    const totalSpark = buildSparkline(growthData.map((item) => item.v + item.f + item.c));
    return {
        range,
        kpis: {
            total: {
                value: subscriptionStats.total,
                change: calcChange(currentGrowth.v + currentGrowth.f + currentGrowth.c, previousGrowth.v + previousGrowth.f + previousGrowth.c),
                sparkline: totalSpark,
            },
            vip: {
                value: subscriptionStats.vip,
                change: calcChange(currentGrowth.v, previousGrowth.v),
                sparkline: vipSpark,
            },
            forex: {
                value: subscriptionStats.forex,
                change: calcChange(currentGrowth.f, previousGrowth.f),
                sparkline: forexSpark,
            },
            crypto: {
                value: subscriptionStats.crypto,
                change: calcChange(currentGrowth.c, previousGrowth.c),
                sparkline: cryptoSpark,
            },
        },
        marketTickers,
        growthData,
        revenueData,
        revenueSummary: {
            total: currentMonthRevenue,
            changePercent: calcChange(currentMonthRevenue, previousMonthRevenue),
        },
        signalPerformance,
        activityFeed,
        systemStatus: "operational",
    };
});
exports.getDashboardStats = getDashboardStats;
