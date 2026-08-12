import httpStatus from "http-status";
import AppError from "../../../errors/AppError";
import queryBuilder from "../../../builder/queryBuilder";
import { resolveUserAccess, getYesterdayRange } from "../../../utils/subscriptionAccess";
import { IUser } from "../user/user.interface";
import { ISignal } from "./signal.interface";
import { SignalModel } from "./signal.model";
import {
  formatSignalForApp,
  formatSignalForDashboard,
  formatSignalDetailForApp,
  buildSignalChartData,
  buildSignalMarketData,
  formatSignalHistoryForApp,
  buildHistoryStats,
} from "./signal.formatter";
import { SignalFavoriteModel, SignalAlertModel } from "./signalUser.model";
import { assertActiveSignalType, buildSignalTypeMatchFilter, normalizeSignalTypeName } from "./signalType.service";

export { formatSignalForApp, formatSignalForDashboard, formatSignalDetailForApp, formatSignalHistoryForApp } from "./signal.formatter";

const normalizeCategory = (category?: string) => {
  const raw = String(category || "").trim();
  const lower = raw.toLowerCase();
  const map: Record<string, ISignal["category"]> = {
    forex: "Forex",
    crypto: "Crypto",
    cryptocurrency: "Crypto",
    commodity: "Commodity",
    gold: "Commodity",
    index: "Index",
  };
  return map[lower] || (["Forex", "Crypto", "Commodity", "Index"].includes(raw) ? raw as ISignal["category"] : "Forex");
};

const normalizeSignalPayload = (payload: Partial<ISignal>) => {
  const data: Partial<ISignal> = { ...payload };

  if (payload.category) {
    data.category = normalizeCategory(payload.category);
  }

  if (data.category === "Commodity") {
    data.isGoldSignal = true;
  }

  if (payload.status === "Active") {
    if (!payload.publishedAt) {
      data.publishedAt = new Date();
    }
    data.signalDate = payload.signalDate ? new Date(payload.signalDate) : new Date();
  }

  if (payload.status === "Scheduled" && payload.scheduledAt) {
    data.signalDate = new Date(payload.scheduledAt);
  }

  return data;
};

export const getAdminSignals = async (query: Record<string, unknown>) => {
  const filter: Record<string, unknown> = { status: { $ne: "Archived" } };

  if (query.status && query.status !== "All") {
    filter.status = query.status;
  }

  if (query.searchTerm) {
    filter.asset = { $regex: String(query.searchTerm), $options: "i" };
  }

  return SignalModel.find(filter).sort({ createdAt: -1 });
};

export const createSignal = async (payload: Partial<ISignal>, adminId?: string) => {
  const data = normalizeSignalPayload(payload);

  if (payload.type) {
    data.type = await assertActiveSignalType(payload.type);
  }

  return SignalModel.create({ ...data, createdBy: adminId });
};

export const updateSignal = async (id: string, payload: Partial<ISignal>) => {
  const data = normalizeSignalPayload(payload);

  if (payload.type) {
    data.type = await assertActiveSignalType(payload.type);
  }

  const updated = await SignalModel.findByIdAndUpdate(id, data, { new: true });
  if (!updated) {
    throw new AppError(httpStatus.NOT_FOUND, "Signal not found.");
  }
  return updated;
};

export const deleteSignal = async (id: string) => {
  const deleted = await SignalModel.findByIdAndDelete(id);
  if (!deleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Signal not found.");
  }
  return deleted;
};

export const publishSignal = async (id: string) => {
  return updateSignal(id, {
    status: "Active",
    publishedAt: new Date(),
    signalDate: new Date(),
  } as Partial<ISignal>);
};

export const closeSignal = async (
  id: string,
  closeResult: "Win" | "Loss" | "Breakeven",
  closePnl?: string,
  exitPrice?: string,
) => {
  return updateSignal(id, {
    status: "Closed",
    closeResult,
    closePnl,
    exitPrice,
    closedAt: new Date(),
  } as Partial<ISignal>);
};

export const archiveSignal = async (id: string) => {
  return updateSignal(id, { status: "Archived" } as Partial<ISignal>);
};

export const duplicateSignal = async (id: string, adminId?: string) => {
  const source = await SignalModel.findById(id);
  if (!source) {
    throw new AppError(httpStatus.NOT_FOUND, "Signal not found.");
  }

  const copy = source.toObject();
  delete copy._id;
  delete copy.createdAt;
  delete copy.updatedAt;

  return SignalModel.create({
    ...copy,
    status: "Draft",
    publishedAt: undefined,
    closeResult: undefined,
    closePnl: undefined,
    createdBy: adminId,
  });
};

const buildAppSignalFilter = (
  access: Awaited<ReturnType<typeof resolveUserAccess>>,
  query: Record<string, unknown>,
) => {
  const andConditions: Record<string, unknown>[] = [{ status: "Active" }];

  if (!access.hasActiveAccess) {
    const { start, end } = getYesterdayRange();
    andConditions.push({ signalDate: { $gte: start, $lte: end } });
  } else {
    if (access.allowedCategories.length) {
      andConditions.push({ category: { $in: access.allowedCategories } });
    }

    if (access.allowedSignalTypes.length) {
      andConditions.push(buildSignalTypeMatchFilter(access.allowedSignalTypes));
    }
  }

  const category = String(query.category || "All").trim();
  const normalizedCategory = category.toLowerCase();
  if (normalizedCategory && normalizedCategory !== "all") {
    if (normalizedCategory === "gold") {
      andConditions.push({ isGoldSignal: true });
    } else {
      const categoryMap: Record<string, string> = {
        forex: "Forex",
        crypto: "Crypto",
        commodity: "Commodity",
        index: "Index",
      };
      andConditions.push({ category: categoryMap[normalizedCategory] || category });
    }
  }

  return andConditions.length === 1 ? andConditions[0] : { $and: andConditions };
};

const isSignalTypeAllowed = (signalType: string, allowedSignalTypes: string[]) => {
  if (!allowedSignalTypes.length) return true;

  const normalizedSignalType = normalizeSignalTypeName(signalType).toLowerCase();
  return allowedSignalTypes.some(
    (type) => normalizeSignalTypeName(type).toLowerCase() === normalizedSignalType,
  );
};

export const assertAppSignalAccess = async (user: IUser, signalId: string) => {
  const access = await resolveUserAccess(user);
  const signal = await SignalModel.findById(signalId);

  if (!signal) {
    throw new AppError(httpStatus.NOT_FOUND, "Signal not found.");
  }

  if (signal.status !== "Active") {
    throw new AppError(httpStatus.NOT_FOUND, "Signal is not available.");
  }

  if (signal.isGoldSignal && !access.includesGoldSignals) {
    throw new AppError(httpStatus.FORBIDDEN, "Your plan does not include gold signals.");
  }

  if (!access.hasActiveAccess) {
    const { start, end } = getYesterdayRange();
    const signalDate = new Date(signal.signalDate);
    if (signalDate < start || signalDate > end) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Subscribe to unlock today's and past signals for your plan.",
      );
    }
  } else {
    if (access.allowedCategories.length && !access.allowedCategories.includes(signal.category)) {
      throw new AppError(httpStatus.FORBIDDEN, "This signal category is not included in your plan.");
    }

    if (!isSignalTypeAllowed(signal.type, access.allowedSignalTypes)) {
      throw new AppError(httpStatus.FORBIDDEN, "This signal type is not included in your plan.");
    }
  }

  return { access, signal };
};

const getSignalUserMeta = async (userId: string, signalId: string) => {
  const [favorite, alert] = await Promise.all([
    SignalFavoriteModel.findOne({ userId, signalId }),
    SignalAlertModel.findOne({ userId, signalId }),
  ]);

  return {
    isFavorite: Boolean(favorite),
    alertsEnabled: Boolean(alert?.enabled),
  };
};

export const getAppSignalById = async (user: IUser, signalId: string) => {
  const { access, signal } = await assertAppSignalAccess(user, signalId);
  const userMeta = await getSignalUserMeta(String(user._id), signalId);

  return {
    access,
    signal: formatSignalDetailForApp(signal, userMeta),
  };
};

export const getAppSignalMarket = async (user: IUser, signalId: string) => {
  const { signal } = await assertAppSignalAccess(user, signalId);
  return buildSignalMarketData(signal);
};

export const getAppSignalChart = async (
  user: IUser,
  signalId: string,
  timeframe = "1W",
) => {
  const { signal } = await assertAppSignalAccess(user, signalId);
  return buildSignalChartData(signal, timeframe);
};

export const setSignalFavorite = async (
  user: IUser,
  signalId: string,
  enabled: boolean,
) => {
  await assertAppSignalAccess(user, signalId);
  const userId = String(user._id);

  if (enabled) {
    await SignalFavoriteModel.findOneAndUpdate(
      { userId, signalId },
      { userId, signalId },
      { upsert: true, new: true },
    );
  } else {
    await SignalFavoriteModel.deleteOne({ userId, signalId });
  }

  return { signalId, isFavorite: enabled };
};

export const setSignalAlerts = async (
  user: IUser,
  signalId: string,
  enabled: boolean,
) => {
  await assertAppSignalAccess(user, signalId);
  const userId = String(user._id);

  await SignalAlertModel.findOneAndUpdate(
    { userId, signalId },
    { userId, signalId, enabled },
    { upsert: true, new: true },
  );

  return { signalId, alertsEnabled: enabled };
};

const normalizeSignalQuery = (query: Record<string, unknown>) => {
  const builderQuery: Record<string, unknown> = { ...query };

  if (query.search && !query.searchTerm) {
    builderQuery.searchTerm = query.search;
  }

  if (!builderQuery.sort) {
    builderQuery.sort = "-publishedAt";
  }

  delete builderQuery.category;
  delete builderQuery.search;
  delete builderQuery.scope;

  return builderQuery;
};

export const getAppSignals = async (
  user: IUser,
  query: Record<string, unknown> = {},
) => {
  const access = await resolveUserAccess(user);
  const baseFilter = buildAppSignalFilter(access, query);
  const builderQuery = normalizeSignalQuery(query);

  let limit = Number(builderQuery.limit) || 10;
  if (access.hasActiveAccess && access.maxSignalsPerDay > 0) {
    limit = Math.min(limit, access.maxSignalsPerDay);
    builderQuery.limit = limit;
  }

  const signalQuery = new queryBuilder(SignalModel.find(baseFilter), builderQuery)
    .search(["asset", "type"] as Array<keyof ISignal>)
    .filter()
    .sort();

  const { totalData } = await signalQuery.paginate(SignalModel.find(baseFilter));
  const signals = await signalQuery.modelQuery.exec();

  const currentPage = Number(builderQuery.page) || 1;
  const pagination = signalQuery.calculatePagination({
    totalData,
    currentPage,
    limit,
  });

  const message = !access.hasActiveAccess
    ? "Showing yesterday's active signals only. Subscribe to unlock today's and past signals for your plan."
    : "Showing today's and previous active signals for your subscription plan.";

  return {
    access,
    signals,
    pagination,
    message,
  };
};

const buildHistoryFilter = (
  access: Awaited<ReturnType<typeof resolveUserAccess>>,
  query: Record<string, unknown>,
) => {
  const andConditions: Record<string, unknown>[] = [{ status: "Closed" }];

  if (access.hasActiveAccess) {
    if (access.allowedCategories.length) {
      andConditions.push({ category: { $in: access.allowedCategories } });
    }
    if (access.allowedSignalTypes.length) {
      andConditions.push(buildSignalTypeMatchFilter(access.allowedSignalTypes));
    }
  }

  const result = String(query.result || query.outcome || "All").trim();
  if (result && result.toLowerCase() !== "all") {
    const normalized =
      result.toLowerCase() === "win"
        ? "Win"
        : result.toLowerCase() === "loss"
          ? "Loss"
          : result.toLowerCase() === "breakeven" || result.toLowerCase() === "break"
            ? "Breakeven"
            : result;
    andConditions.push({ closeResult: normalized });
  }

  const category = String(query.category || "All").trim();
  if (category && category.toLowerCase() !== "all") {
    const categoryMap: Record<string, string> = {
      forex: "Forex",
      crypto: "Crypto",
      commodity: "Commodity",
      index: "Index",
    };
    andConditions.push({ category: categoryMap[category.toLowerCase()] || category });
  }

  const search = String(query.search || query.searchTerm || "").trim();
  if (search) {
    andConditions.push({ asset: { $regex: search, $options: "i" } });
  }

  return andConditions.length === 1 ? andConditions[0] : { $and: andConditions };
};

export const getAppSignalHistory = async (
  user: IUser,
  query: Record<string, unknown> = {},
) => {
  const access = await resolveUserAccess(user);

  if (!access.hasActiveAccess) {
    return {
      access,
      performanceOverview: buildHistoryStats([]),
      signals: [],
      pagination: {
        totalPage: 1,
        currentPage: 1,
        prevPage: 1,
        nextPage: 1,
        totalData: 0,
      },
      totalClosedSignals: 0,
      message: "Subscribe to unlock your completed signal history.",
    };
  }

  const baseFilter = buildHistoryFilter(access, query);
  const builderQuery = normalizeSignalQuery(query);
  const limit = Number(builderQuery.limit) || 10;
  const page = Number(builderQuery.page) || 1;

  const allClosedForStats = await SignalModel.find(baseFilter).select("closeResult");
  const performanceOverview = buildHistoryStats(allClosedForStats);

  const signalQuery = new queryBuilder(SignalModel.find(baseFilter), {
    ...builderQuery,
    sort: builderQuery.sort || "-closedAt",
    limit,
    page,
  })
    .search(["asset", "type"] as Array<keyof ISignal>)
    .filter()
    .sort();

  const { totalData } = await signalQuery.paginate(SignalModel.find(baseFilter));
  const signals = await signalQuery.modelQuery.exec();

  const pagination = signalQuery.calculatePagination({
    totalData,
    currentPage: page,
    limit,
  });

  return {
    access,
    performanceOverview,
    signals: signals.map(formatSignalHistoryForApp),
    pagination,
    totalClosedSignals: totalData,
    message: "Track your completed trading signals.",
  };
};
