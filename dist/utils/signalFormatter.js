"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTakeProfits = exports.getTypeLabel = exports.getFilterCategory = exports.getCategoryLabel = exports.formatPublishedLabel = exports.getRelativeTime = exports.calculateRiskReward = exports.formatPercentChange = exports.parsePrice = void 0;
const parsePrice = (value) => {
    if (!value || value === "—")
        return null;
    const cleaned = value.replace(/,/g, "").replace(/[^\d.-]/g, "");
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : null;
};
exports.parsePrice = parsePrice;
const formatPercentChange = (from, to) => {
    if (!from)
        return "0.00%";
    const pct = ((to - from) / from) * 100;
    const sign = pct >= 0 ? "+" : "";
    return `${sign}${pct.toFixed(2)}%`;
};
exports.formatPercentChange = formatPercentChange;
const calculateRiskReward = (entry, sl, tp) => {
    const risk = Math.abs(entry - sl);
    const reward = Math.abs(tp - entry);
    if (!risk || !reward)
        return "1:1";
    const ratio = reward / risk;
    return `1:${ratio.toFixed(1)}`;
};
exports.calculateRiskReward = calculateRiskReward;
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
exports.getRelativeTime = getRelativeTime;
const formatPublishedLabel = (date) => {
    if (!date)
        return "—";
    return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};
exports.formatPublishedLabel = formatPublishedLabel;
const getCategoryLabel = (category, isGoldSignal) => {
    if (isGoldSignal || category === "Commodity")
        return "Gold / Metals";
    if (category === "Crypto")
        return "Cryptocurrency";
    if (category === "Forex")
        return "Forex";
    if (category === "Index")
        return "Index";
    return category;
};
exports.getCategoryLabel = getCategoryLabel;
const getFilterCategory = (category, isGoldSignal) => {
    if (isGoldSignal || category === "Commodity")
        return "Gold";
    return category;
};
exports.getFilterCategory = getFilterCategory;
const getTypeLabel = (type) => {
    const map = {
        Scalp: "Scalp Trade",
        Swing: "Swing Trade",
        Intraday: "Intraday Trade",
        Position: "Position Trade",
        "Long-term": "Long-term Trade",
    };
    return map[type] || type;
};
exports.getTypeLabel = getTypeLabel;
const buildTakeProfits = (entryNum, tp1, tp2, tp3, hits) => {
    const items = [
        { label: "TP1", price: tp1, isHit: (hits === null || hits === void 0 ? void 0 : hits.tp1Hit) || false },
        { label: "TP2", price: tp2 || "—", isHit: (hits === null || hits === void 0 ? void 0 : hits.tp2Hit) || false },
        { label: "TP3", price: tp3 || "—", isHit: (hits === null || hits === void 0 ? void 0 : hits.tp3Hit) || false },
    ];
    return items
        .filter((item) => item.price && item.price !== "—")
        .map((item) => {
        const numeric = (0, exports.parsePrice)(item.price);
        return {
            label: item.label,
            price: item.price,
            numeric,
            changePercent: entryNum && numeric ? (0, exports.formatPercentChange)(entryNum, numeric) : null,
            isHit: item.isHit,
            status: item.isHit ? "HIT" : "PENDING",
        };
    });
};
exports.buildTakeProfits = buildTakeProfits;
