import httpStatus from "http-status";
import AppError from "../../../errors/AppError";
import { ISignalType } from "./signalType.interface";
import { SignalTypeModel } from "./signalType.model";

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const normalizeSignalTypeName = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

export const getSignalTypes = async (includeInactive = false) => {
  const filter = includeInactive ? {} : { isActive: true };
  return SignalTypeModel.find(filter).sort({ name: 1 });
};

export const getActiveSignalTypeNames = async () => {
  const types = await SignalTypeModel.find({ isActive: true }).sort({ name: 1 });
  return types.map((type) => type.name);
};

export const createSignalType = async (name: string) => {
  const normalized = normalizeSignalTypeName(name);
  if (!normalized) {
    throw new AppError(httpStatus.BAD_REQUEST, "Signal type name is required.");
  }

  const existing = await SignalTypeModel.findOne({
    name: { $regex: `^${escapeRegex(normalized)}$`, $options: "i" },
  });

  if (existing) {
    throw new AppError(httpStatus.BAD_REQUEST, "This signal type already exists.");
  }

  return SignalTypeModel.create({ name: normalized, isActive: true });
};

export const updateSignalType = async (
  id: string,
  payload: Partial<Pick<ISignalType, "name" | "isActive">>,
) => {
  const data: Partial<ISignalType> = { ...payload };

  if (payload.name) {
    const normalized = normalizeSignalTypeName(payload.name);
    if (!normalized) {
      throw new AppError(httpStatus.BAD_REQUEST, "Signal type name is required.");
    }

    const duplicate = await SignalTypeModel.findOne({
      _id: { $ne: id },
      name: { $regex: `^${escapeRegex(normalized)}$`, $options: "i" },
    });

    if (duplicate) {
      throw new AppError(httpStatus.BAD_REQUEST, "This signal type already exists.");
    }

    data.name = normalized;
  }

  const updated = await SignalTypeModel.findByIdAndUpdate(id, data, { new: true });
  if (!updated) {
    throw new AppError(httpStatus.NOT_FOUND, "Signal type not found.");
  }

  return updated;
};

export const deleteSignalType = async (id: string) => {
  const deleted = await SignalTypeModel.findByIdAndDelete(id);
  if (!deleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Signal type not found.");
  }
  return deleted;
};

export const assertActiveSignalType = async (type: string) => {
  const normalized = normalizeSignalTypeName(type);
  if (!normalized) {
    throw new AppError(httpStatus.BAD_REQUEST, "Signal type is required.");
  }

  const exists = await SignalTypeModel.findOne({
    name: { $regex: `^${escapeRegex(normalized)}$`, $options: "i" },
    isActive: true,
  });

  if (!exists) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Invalid signal type. Choose a type from the admin list.",
    );
  }

  return exists.name;
};

export const buildSignalTypeMatchFilter = (allowedSignalTypes: string[]) => {
  const normalized = allowedSignalTypes
    .map((type) => normalizeSignalTypeName(type))
    .filter(Boolean);

  if (!normalized.length) {
    return { type: { $in: [] as string[] } };
  }

  return {
    $or: normalized.map((type) => ({
      type: { $regex: `^${escapeRegex(type)}$`, $options: "i" },
    })),
  };
};
