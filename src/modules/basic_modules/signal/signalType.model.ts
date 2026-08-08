import mongoose, { Schema } from "mongoose";
import { ISignalType } from "./signalType.interface";

const SignalTypeSchema = new Schema<ISignalType>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const SignalTypeModel =
  mongoose.models.SignalType ||
  mongoose.model<ISignalType>("SignalType", SignalTypeSchema);
