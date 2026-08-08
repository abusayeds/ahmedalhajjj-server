import { ISignal } from "./signal.interface";

const CATEGORY_LABELS: Record<string, string> = {
  Forex: "Forex",
  Crypto: "Cryptocurrency",
  Commodity: "Gold",
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
  notes: signal.notes || "",
  scheduledAt: signal.scheduledAt,
  closeResult: signal.closeResult,
  closePnl: signal.closePnl,
});

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
