import httpStatus from "http-status";
import AppError from "../../../errors/AppError";
import queryBuilder from "../../../builder/queryBuilder";
import { resolveUserAccess, getTodayRange, getYesterdayRange } from "../../../utils/subscriptionAccess";
import { IUser } from "../user/user.interface";
import { ISignal } from "./signal.interface";
import { SignalModel } from "./signal.model";
import {
  formatSignalForApp,
  formatSignalForDashboard,
} from "./signal.formatter";
import { assertActiveSignalType, buildSignalTypeMatchFilter } from "./signalType.service";

export { formatSignalForApp, formatSignalForDashboard } from "./signal.formatter";

const normalizeSignalPayload = (payload: Partial<ISignal>) => {
  const data: Partial<ISignal> = { ...payload };

  if (payload.category === "Commodity") {
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
) => {
  return updateSignal(id, {
    status: "Closed",
    closeResult,
    closePnl,
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
    const { start, end } = getTodayRange();
    andConditions.push({ signalDate: { $gte: start, $lte: end } });

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
    ? "Showing previous day active signals only. Subscribe for today's live signals."
    : "Live active signals for your subscription plan.";

  return {
    access,
    signals,
    pagination,
    message,
  };
};
