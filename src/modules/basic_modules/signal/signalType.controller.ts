import { Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { AuthRequest } from "../../../middlewares/auth";
import {
  createSignalType,
  deleteSignalType,
  getSignalTypes,
  updateSignalType,
} from "./signalType.service";

export const getSignalTypesHandler = catchAsync(async (req: AuthRequest, res: Response) => {
  const includeInactive = String(req.query.includeInactive || "") === "true";
  const types = await getSignalTypes(includeInactive);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Signal types retrieved successfully",
    data: types,
  });
});

export const createSignalTypeHandler = catchAsync(async (req: AuthRequest, res: Response) => {
  const created = await createSignalType(req.body.name);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Signal type created successfully",
    data: created,
  });
});

export const updateSignalTypeHandler = catchAsync(async (req: AuthRequest, res: Response) => {
  const updated = await updateSignalType(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Signal type updated successfully",
    data: updated,
  });
});

export const deleteSignalTypeHandler = catchAsync(async (req: AuthRequest, res: Response) => {
  await deleteSignalType(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Signal type deleted successfully",
    data: null,
  });
});
