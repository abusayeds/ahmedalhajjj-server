import httpStatus from "http-status";
import AppError from "../errors/AppError";
import catchAsync from "../utils/catchAsync";
import sendResponse from "../utils/sendResponse";

export const uploadFile = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new AppError(httpStatus.BAD_REQUEST, "No file uploaded.");
  }

  const file = req.file;
  const publicUrl = `/images/${file.filename}`;

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "File uploaded successfully",
    data: {
      url: publicUrl,
      path: file.path.replace(/\\/g, "/"),
    },
  });
});
