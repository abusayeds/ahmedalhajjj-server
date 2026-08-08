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
exports.seedSignals = void 0;
const user_model_1 = require("../user/user.model");
const signal_model_1 = require("./signal.model");
const SEED_MARKER = "[SEED]";
const dayAt = (offsetDays, hour = 10, minute = 0) => {
    const d = new Date();
    d.setHours(hour, minute, 0, 0);
    d.setDate(d.getDate() + offsetDays);
    return d;
};
const seedSignals = () => __awaiter(void 0, void 0, void 0, function* () {
    const admin = yield user_model_1.UserModel.findOne({ role: "admin" }).select("_id");
    const adminId = admin === null || admin === void 0 ? void 0 : admin._id;
    yield signal_model_1.SignalModel.deleteMany({ notes: { $regex: SEED_MARKER } });
    const today = dayAt(0);
    const yesterday = dayAt(-1);
    const tomorrow = dayAt(1, 9, 30);
    const twoDaysAgo = dayAt(-2);
    const signals = [
        // ── Active (today) — live app + dashboard ──
        {
            asset: "EUR/USD",
            category: "Forex",
            type: "Scalp",
            direction: "BUY",
            entry: "1.0842",
            sl: "1.0825",
            tp1: "1.0860",
            tp2: "1.0875",
            tp3: "1.0890",
            notes: `${SEED_MARKER} Bullish momentum on H1; watch US session open.`,
            status: "Active",
            publishedAt: dayAt(0, 8, 15),
            signalDate: today,
            createdBy: adminId,
        },
        {
            asset: "GBP/JPY",
            category: "Forex",
            type: "Swing",
            direction: "SELL",
            entry: "198.450",
            sl: "199.100",
            tp1: "197.800",
            tp2: "197.200",
            notes: `${SEED_MARKER} Bearish rejection at daily resistance.`,
            status: "Active",
            publishedAt: dayAt(0, 9, 0),
            signalDate: today,
            createdBy: adminId,
        },
        {
            asset: "BTC/USDT",
            category: "Crypto",
            type: "Scalp",
            direction: "BUY",
            entry: "67250",
            sl: "66800",
            tp1: "67800",
            tp2: "68500",
            tp3: "69200",
            notes: `${SEED_MARKER} Breakout above 4H range; volume confirming.`,
            status: "Active",
            publishedAt: dayAt(0, 7, 45),
            signalDate: today,
            createdBy: adminId,
        },
        {
            asset: "ETH/USDT",
            category: "Crypto",
            type: "Swing",
            direction: "SELL",
            entry: "3420",
            sl: "3520",
            tp1: "3320",
            tp2: "3250",
            notes: `${SEED_MARKER} Double top on daily; risk-off sentiment.`,
            status: "Active",
            publishedAt: dayAt(0, 10, 30),
            signalDate: today,
            createdBy: adminId,
        },
        {
            asset: "XAU/USD",
            category: "Commodity",
            type: "Long-term",
            direction: "BUY",
            entry: "2348.50",
            sl: "2335.00",
            tp1: "2365.00",
            tp2: "2380.00",
            tp3: "2400.00",
            notes: `${SEED_MARKER} Safe-haven demand; Fed dovish tone.`,
            status: "Active",
            publishedAt: dayAt(0, 6, 30),
            signalDate: today,
            isGoldSignal: true,
            createdBy: adminId,
        },
        {
            asset: "US30",
            category: "Index",
            type: "Swing",
            direction: "BUY",
            entry: "39250",
            sl: "39080",
            tp1: "39420",
            tp2: "39600",
            notes: `${SEED_MARKER} Index holding above 50 EMA on daily.`,
            status: "Active",
            publishedAt: dayAt(0, 14, 0),
            signalDate: today,
            createdBy: adminId,
        },
        // ── Draft — admin list filter ──
        {
            asset: "USD/CAD",
            category: "Forex",
            type: "Scalp",
            direction: "SELL",
            entry: "1.3620",
            sl: "1.3655",
            tp1: "1.3585",
            notes: `${SEED_MARKER} Draft — oil correlation setup pending confirmation.`,
            status: "Draft",
            signalDate: today,
            createdBy: adminId,
        },
        {
            asset: "SOL/USDT",
            category: "Crypto",
            type: "Scalp",
            direction: "BUY",
            entry: "178.50",
            sl: "174.00",
            tp1: "185.00",
            notes: `${SEED_MARKER} Draft — waiting for BTC direction.`,
            status: "Draft",
            signalDate: today,
            createdBy: adminId,
        },
        // ── Scheduled — future publish ──
        {
            asset: "AUD/USD",
            category: "Forex",
            type: "Swing",
            direction: "BUY",
            entry: "0.6580",
            sl: "0.6540",
            tp1: "0.6620",
            tp2: "0.6660",
            notes: `${SEED_MARKER} Scheduled for Sydney session open.`,
            status: "Scheduled",
            scheduledAt: tomorrow,
            signalDate: tomorrow,
            createdBy: adminId,
        },
        {
            asset: "BNB/USDT",
            category: "Crypto",
            type: "Scalp",
            direction: "SELL",
            entry: "585.00",
            sl: "598.00",
            tp1: "572.00",
            notes: `${SEED_MARKER} Scheduled — post weekly close analysis.`,
            status: "Scheduled",
            scheduledAt: dayAt(1, 12, 0),
            signalDate: dayAt(1, 12, 0),
            createdBy: adminId,
        },
        // ── Closed (today) — dashboard win/loss stats ──
        {
            asset: "NAS100",
            category: "Index",
            type: "Scalp",
            direction: "BUY",
            entry: "18250",
            sl: "18180",
            tp1: "18320",
            notes: `${SEED_MARKER} Closed winner — TP1 hit pre-market.`,
            status: "Closed",
            closeResult: "Win",
            closePnl: "+70 pts",
            publishedAt: dayAt(0, 5, 0),
            signalDate: today,
            createdBy: adminId,
        },
        {
            asset: "XRP/USDT",
            category: "Crypto",
            type: "Scalp",
            direction: "SELL",
            entry: "0.6120",
            sl: "0.6250",
            tp1: "0.5980",
            notes: `${SEED_MARKER} Closed loss — stopped out on news spike.`,
            status: "Closed",
            closeResult: "Loss",
            closePnl: "-1.3%",
            publishedAt: dayAt(0, 4, 30),
            signalDate: today,
            createdBy: adminId,
        },
        // ── Yesterday — free-user app access (previous day only) ──
        {
            asset: "EUR/GBP",
            category: "Forex",
            type: "Swing",
            direction: "BUY",
            entry: "0.8420",
            sl: "0.8390",
            tp1: "0.8460",
            tp2: "0.8490",
            notes: `${SEED_MARKER} Yesterday winner — visible to free users.`,
            status: "Closed",
            closeResult: "Win",
            closePnl: "+40 pips",
            publishedAt: dayAt(-1, 9, 0),
            signalDate: yesterday,
            createdBy: adminId,
        },
        {
            asset: "DOGE/USDT",
            category: "Crypto",
            type: "Scalp",
            direction: "BUY",
            entry: "0.1280",
            sl: "0.1240",
            tp1: "0.1340",
            notes: `${SEED_MARKER} Yesterday breakeven — manual close at entry.`,
            status: "Closed",
            closeResult: "Breakeven",
            closePnl: "0%",
            publishedAt: dayAt(-1, 15, 0),
            signalDate: yesterday,
            createdBy: adminId,
        },
        {
            asset: "XAU/USD",
            category: "Commodity",
            type: "Swing",
            direction: "SELL",
            entry: "2362.00",
            sl: "2375.00",
            tp1: "2345.00",
            notes: `${SEED_MARKER} Yesterday gold short — loss for free tier history.`,
            status: "Closed",
            closeResult: "Loss",
            closePnl: "-$17",
            publishedAt: dayAt(-1, 11, 0),
            signalDate: yesterday,
            isGoldSignal: true,
            createdBy: adminId,
        },
        // ── Older history — dashboard charts / archive testing ──
        {
            asset: "USD/JPY",
            category: "Forex",
            type: "Long-term",
            direction: "SELL",
            entry: "157.80",
            sl: "158.60",
            tp1: "156.50",
            notes: `${SEED_MARKER} 2 days ago — archived performance data.`,
            status: "Closed",
            closeResult: "Win",
            closePnl: "+130 pips",
            publishedAt: dayAt(-2, 8, 0),
            signalDate: twoDaysAgo,
            createdBy: adminId,
        },
    ];
    yield signal_model_1.SignalModel.insertMany(signals);
    console.log(`✓ Seeded ${signals.length} test signals (${SEED_MARKER})`);
});
exports.seedSignals = seedSignals;
