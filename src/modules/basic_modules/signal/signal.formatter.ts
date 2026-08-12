import { ISignal } from "./signal.interface";

const CATEGORY_LABELS: Record<string, string> = {
  Forex: "Forex",
  Crypto: "Crypto",
  Commodity: "Commodity",
  Index: "Index",
};

const parsePrice = (value?: string) => {
  if (!value || value === "—") return null;
  const parsed = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
};

const formatPercent = (value: number) => `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;

export const calcSlPercent = (entry: string, sl: string, direction: string) => {
  const entryPrice = parsePrice(entry);
  const slPrice = parsePrice(sl);
  if (entryPrice === null || slPrice === null || entryPrice === 0) return null;

  const raw = ((slPrice - entryPrice) / entryPrice) * 100;
  const adjusted = direction === "SELL" ? -raw : raw;
  return formatPercent(adjusted);
};

export const calcTpPercent = (entry: string, tp: string, direction: string) => {
  const entryPrice = parsePrice(entry);
  const tpPrice = parsePrice(tp);
  if (entryPrice === null || tpPrice === null || entryPrice === 0) return null;

  const raw = ((tpPrice - entryPrice) / entryPrice) * 100;
  const adjusted = direction === "SELL" ? -raw : raw;
  return formatPercent(adjusted);
};

export const calcRiskReward = (entry: string, sl: string, tp1: string) => {
  const entryPrice = parsePrice(entry);
  const slPrice = parsePrice(sl);
  const tpPrice = parsePrice(tp1);
  if (
    entryPrice === null ||
    slPrice === null ||
    tpPrice === null ||
    entryPrice === slPrice
  ) {
    return null;
  }

  const risk = Math.abs(entryPrice - slPrice);
  const reward = Math.abs(tpPrice - entryPrice);
  if (risk === 0) return null;

  const ratio = reward / risk;
  return `1:${ratio.toFixed(1)}`;
};

export const getRelativeTime = (date?: Date) => {
  if (!date) return "Recently";
  const diffMs = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export const formatPublishedLabel = (date?: Date) => {
  if (!date) return "—";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatSignalForDashboard = (signal: ISignal) => ({
  id: signal._id,
  _id: signal._id,
  asset: signal.asset,
  cat: signal.category,
  type: signal.type,
  dir: signal.direction,
  entry: signal.entry,
  sl: signal.sl,
  tp1: signal.tp1,
  tp2: signal.tp2 || "—",
  tp3: signal.tp3 || "—",
  status: signal.status,
  pub: formatPublishedLabel(signal.publishedAt || signal.createdAt),
  signalDate: signal.signalDate ? new Date(signal.signalDate).toISOString() : undefined,
  notes: signal.notes || "",
  scheduledAt: signal.scheduledAt ? new Date(signal.scheduledAt).toISOString() : undefined,
  closeResult: signal.closeResult,
  closePnl: signal.closePnl,
});

const MARKET_CATEGORY_LABELS: Record<string, string> = {
  Forex: "Forex",
  Crypto: "Cryptocurrency",
  Commodity: "Commodity",
  Index: "Index",
};

const DEFAULT_PRO_TIP =
  "Move Stop Loss to Break Even (BE) after TP1 is hit to secure profits.";

const splitAssetPair = (asset: string) => {
  const parts = asset.split("/");
  if (parts.length === 2) {
    return { baseAsset: parts[0].trim(), quoteAsset: parts[1].trim() };
  }
  return { baseAsset: asset, quoteAsset: "" };
};

const calcPercentFromEntry = (entry: string, level: string, direction: string) => {
  const entryPrice = parsePrice(entry);
  const levelPrice = parsePrice(level);
  if (entryPrice === null || levelPrice === null || entryPrice === 0) return null;

  const raw = ((levelPrice - entryPrice) / entryPrice) * 100;
  const adjusted = direction === "SELL" ? -raw : raw;
  return Number(adjusted.toFixed(2));
};

const buildLevelBlock = (
  label: string,
  priceValue: string,
  status: string,
  direction: string,
  entry: string,
  hitAt?: Date,
) => {
  const price = parsePrice(priceValue);
  const percentFromEntry = calcPercentFromEntry(entry, priceValue, direction);

  return {
    price,
    priceLabel: priceValue,
    label,
    status,
    statusLabel: status,
    percentFromEntry,
    percentLabel: percentFromEntry === null ? null : formatPercent(percentFromEntry),
    hitAt: hitAt ? new Date(hitAt).toISOString() : null,
  };
};

export const formatSignalDetailForApp = (
  signal: ISignal,
  options: { isFavorite?: boolean; alertsEnabled?: boolean } = {},
) => {
  const { baseAsset, quoteAsset } = splitAssetPair(signal.asset);
  const publishedAt = signal.publishedAt || signal.createdAt;
  const entryStatus = signal.entryStatus || "FILLED";
  const stopLossStatus = signal.stopLossStatus || "ACTIVE";

  const takeProfits = [
    {
      key: "tp1",
      level: 1,
      ...buildLevelBlock(
        "Take Profit 1 (TP1)",
        signal.tp1,
        signal.tp1Status || "PENDING",
        signal.direction,
        signal.entry,
        signal.tp1HitAt,
      ),
    },
  ];

  if (signal.tp2 && signal.tp2 !== "—") {
    takeProfits.push({
      key: "tp2",
      level: 2,
      ...buildLevelBlock(
        "Take Profit 2 (TP2)",
        signal.tp2,
        signal.tp2Status || "PENDING",
        signal.direction,
        signal.entry,
        signal.tp2HitAt,
      ),
    });
  }

  if (signal.tp3 && signal.tp3 !== "—") {
    takeProfits.push({
      key: "tp3",
      level: 3,
      ...buildLevelBlock(
        "Take Profit 3 (TP3)",
        signal.tp3,
        signal.tp3Status || "PENDING",
        signal.direction,
        signal.entry,
        signal.tp3HitAt,
      ),
    });
  }

  const entryPrice = parsePrice(signal.entry) || 0;
  const mockCurrentPrice =
    entryPrice > 0
      ? Number(
          (entryPrice * (signal.direction === "BUY" ? 1.0063 : 0.9937)).toFixed(
            entryPrice > 100 ? 2 : 4,
          ),
        )
      : null;

  return {
    header: {
      id: signal._id,
      asset: signal.asset,
      baseAsset,
      quoteAsset,
      direction: signal.direction,
      directionLabel: `${signal.direction} Signal`,
      status: signal.status,
      statusLabel: signal.status,
      isGoldSignal: signal.isGoldSignal,
      isFavorite: Boolean(options.isFavorite),
    },
    live: {
      currentPrice: mockCurrentPrice,
      currency: "USD",
      change24h: mockCurrentPrice && entryPrice ? Number((((mockCurrentPrice - entryPrice) / entryPrice) * 100).toFixed(2)) : null,
      change24hLabel:
        mockCurrentPrice && entryPrice
          ? formatPercent(((mockCurrentPrice - entryPrice) / entryPrice) * 100)
          : null,
      trend: signal.direction === "BUY" ? "up" : "down",
      lastUpdatedAt: new Date().toISOString(),
      source: "placeholder",
    },
    summary: {
      statistics: {
        previousClose: entryPrice ? Number((entryPrice * 0.9967).toFixed(2)) : null,
        openingPrice: entryPrice || null,
        returns24h:
          mockCurrentPrice && entryPrice
            ? Number((((mockCurrentPrice - entryPrice) / entryPrice) * 100).toFixed(2))
            : null,
        returns24hLabel:
          mockCurrentPrice && entryPrice
            ? formatPercent(((mockCurrentPrice - entryPrice) / entryPrice) * 100)
            : null,
      },
      proTip: {
        title: "Pro Tip",
        message: signal.proTip?.trim() || DEFAULT_PRO_TIP,
      },
    },
    details: {
      overview: {
        asset: signal.asset,
        marketCategory: MARKET_CATEGORY_LABELS[signal.category] || signal.category,
        category: signal.category,
        tradeType: `${signal.type} Trade`,
        type: signal.type,
        direction: signal.direction,
        riskRewardRatio: calcRiskReward(signal.entry, signal.sl, signal.tp1),
        publishedAt,
        publishedLabel: formatPublishedLabel(publishedAt),
        timeAgo: getRelativeTime(publishedAt),
        signalDate: signal.signalDate ? new Date(signal.signalDate).toISOString() : null,
      },
      levels: {
        entry: buildLevelBlock("Entry Price", signal.entry, entryStatus, signal.direction, signal.entry),
        stopLoss: buildLevelBlock("Stop Loss (SL)", signal.sl, stopLossStatus, signal.direction, signal.entry),
        takeProfits,
      },
      notes: signal.notes || "",
      closeResult: signal.closeResult || null,
      closePnl: signal.closePnl || null,
    },
    userActions: {
      alertsEnabled: Boolean(options.alertsEnabled),
      canEnableAlerts: signal.status === "Active",
      canFavorite: true,
    },
    chart: {
      defaultTimeframe: "1W",
      availableTimeframes: ["1H", "24H", "3D", "1W", "1M", "6M"],
      overlayLines: {
        entry: parsePrice(signal.entry),
        stopLoss: parsePrice(signal.sl),
        takeProfits: takeProfits.map((tp) => tp.price).filter(Boolean),
      },
    },
  };
};

export const buildSignalChartData = (signal: ISignal, timeframe = "1W") => {
  const entryPrice = parsePrice(signal.entry) || 100;
  const points = timeframe === "1H" ? 12 : timeframe === "24H" ? 24 : 7;
  const candles = Array.from({ length: points }, (_, index) => {
    const drift = (index - points / 2) * 0.0025;
    const open = Number((entryPrice * (1 + drift)).toFixed(2));
    const close = Number((open * (1 + (signal.direction === "BUY" ? 0.0015 : -0.0015))).toFixed(2));
    const high = Number(Math.max(open, close, open * 1.003).toFixed(2));
    const low = Number(Math.min(open, close, open * 0.997).toFixed(2));
    const time = Math.floor(Date.now() / 1000) - (points - index) * 3600;

    return { time, open, high, low, close };
  });

  return {
    timeframe,
    symbol: signal.asset.replace("/", ""),
    candles,
    overlays: {
      entry: parsePrice(signal.entry),
      stopLoss: parsePrice(signal.sl),
      takeProfits: [signal.tp1, signal.tp2, signal.tp3]
        .map(parsePrice)
        .filter((value): value is number => value !== null),
    },
    source: "placeholder",
  };
};

export const buildSignalMarketData = (signal: ISignal) => {
  const detail = formatSignalDetailForApp(signal);
  return {
    asset: signal.asset,
    currentPrice: detail.live.currentPrice,
    change24h: detail.live.change24h,
    change24hLabel: detail.live.change24hLabel,
    statistics: detail.summary.statistics,
    lastUpdatedAt: detail.live.lastUpdatedAt,
    source: "placeholder",
  };
};

export const formatSignalForApp = (signal: ISignal) => ({
  id: signal._id,
  asset: signal.asset,
  category: signal.category,
  categoryLabel: CATEGORY_LABELS[signal.category] || signal.category,
  type: signal.type,
  direction: signal.direction,
  entry: signal.entry,
  sl: signal.sl,
  slPercent: calcSlPercent(signal.entry, signal.sl, signal.direction),
  tp1: signal.tp1,
  tp2: signal.tp2 && signal.tp2 !== "—" ? signal.tp2 : null,
  tp3: signal.tp3 && signal.tp3 !== "—" ? signal.tp3 : null,
  tp1Percent: calcTpPercent(signal.entry, signal.tp1, signal.direction),
  riskReward: calcRiskReward(signal.entry, signal.sl, signal.tp1),
  status: signal.status,
  publishedAt: signal.publishedAt || signal.createdAt,
  publishedLabel: formatPublishedLabel(signal.publishedAt || signal.createdAt),
  timeAgo: getRelativeTime(signal.publishedAt || signal.createdAt),
  notes: signal.notes || "",
  isGoldSignal: signal.isGoldSignal,
});

const TYPE_TIMEFRAME: Record<string, string> = {
  Scalp: "15 min",
  Swing: "1 hour",
  Intraday: "4 hours",
  "Long-term": "1 week",
  Position: "1 day",
};

const parsePnlPercent = (closePnl?: string) => {
  if (!closePnl) return null;
  const match = closePnl.match(/([+-]?\d+(?:\.\d+)?)\s*%/);
  return match ? Number(match[1]) : null;
};

const formatDuration = (start?: Date, end?: Date) => {
  if (!start || !end) return null;
  const diffMs = new Date(end).getTime() - new Date(start).getTime();
  const hours = Math.floor(diffMs / 3600000);
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""}`;
  }
  if (hours >= 1) return `${hours}h`;
  const mins = Math.max(1, Math.floor(diffMs / 60000));
  return `${mins}m`;
};

const formatClosedLabel = (date?: Date) => {
  if (!date) return "—";
  return `Closed ${date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
};

export const buildHistoryStats = (signals: ISignal[]) => {
  const wins = signals.filter((signal) => signal.closeResult === "Win").length;
  const losses = signals.filter((signal) => signal.closeResult === "Loss").length;
  const breakeven = signals.filter((signal) => signal.closeResult === "Breakeven").length;
  const total = wins + losses + breakeven;
  const winRate = total > 0 ? Number(((wins / total) * 100).toFixed(1)) : 0;

  return {
    wins,
    losses,
    breakeven,
    total,
    winRate,
    winRateLabel: `${winRate}%`,
  };
};

export const formatSignalHistoryForApp = (signal: ISignal) => {
  const entryPrice = parsePrice(signal.entry);
  const exitPrice = parsePrice(signal.exitPrice || signal.tp1);
  const pnlPercent = parsePnlPercent(signal.closePnl);
  const openedAt = signal.publishedAt || signal.createdAt;
  const closedAt = signal.closedAt || signal.updatedAt;

  return {
    id: signal._id,
    asset: signal.asset,
    category: signal.category,
    categoryLabel: CATEGORY_LABELS[signal.category] || signal.category,
    direction: signal.direction,
    type: signal.type,
    timeframeLabel: TYPE_TIMEFRAME[signal.type] || signal.type,
    actionLabel: `${signal.direction} · ${TYPE_TIMEFRAME[signal.type] || signal.type}`,
    riskRewardRatio: calcRiskReward(signal.entry, signal.sl, signal.tp1),
    entryPrice,
    entryPriceLabel: signal.entry,
    exitPrice,
    exitPriceLabel: signal.exitPrice || signal.tp1,
    priceMovementLabel:
      entryPrice && exitPrice
        ? `$${entryPrice.toLocaleString()} → $${exitPrice.toLocaleString()}`
        : `${signal.entry} → ${signal.exitPrice || signal.tp1}`,
    pnlPercent,
    pnlLabel: signal.closePnl || (pnlPercent !== null ? formatPercent(pnlPercent) : null),
    closeResult: signal.closeResult || null,
    outcomeLabel: signal.closeResult ? signal.closeResult.toUpperCase() : null,
    isWin: signal.closeResult === "Win",
    isLoss: signal.closeResult === "Loss",
    isBreakeven: signal.closeResult === "Breakeven",
    duration: formatDuration(openedAt, closedAt),
    closedAt,
    closedLabel: formatClosedLabel(closedAt),
    publishedAt: openedAt,
    notes: signal.notes || "",
  };
};
