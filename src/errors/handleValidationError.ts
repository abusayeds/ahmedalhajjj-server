import mongoose from "mongoose";
import { TGenericErrorResponse } from "../interface/error";


const hendleMongooseValidationError = (
  err: mongoose.Error.ValidationError
): TGenericErrorResponse => {
  const errorSoures = Object.values(err.errors).map(
    (val: mongoose.Error.ValidatorError | mongoose.Error.CastError) => {
      return {
        path: val?.path,
        message: val?.message
      }
    }


  );
  const statusCode = 500
  return {
    statusCode,
    message: 'Mongoose validation error',
    errorSoures
  }
};
export default hendleMongooseValidationError