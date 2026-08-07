import mongoose from "mongoose";
import { TErrorSoureces, TGenericErrorResponse } from "../interface/error";
const hendelCastError = (
  err: mongoose.Error.CastError
): TGenericErrorResponse => {
  const  errorSoures: TErrorSoureces = [
    {
      path: err.path,
      message: err.message,
    },
  ];

  const statusCode = 400;
  return {
    statusCode,
    message: "Invalid ID  ",
     errorSoures,
  };
};
export default hendelCastError;