import mongoose, { Schema } from "mongoose";
import { ISignal } from "./signal.interface";

const SignalSchema = new Schema<ISignal>(
  {
    asset: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["Forex", "Crypto", "Commodity", "Index"],
      required: true,
    },
    type: { type: String, required: true, trim: true },
    direction: { type: String, enum: ["BUY", "SELL"], required: true },
    entry: { type: String, required: true },
    sl: { type: String, required: true },
    tp1: { type: String, required: true },
    tp2: { type: String, default: "—" },
    tp3: { type: String, default: "—" },
    notes: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Active", "Draft", "Scheduled", "Closed", "Archived"],
      default: "Draft",
    },
    scheduledAt: { type: Date },
    publishedAt: { type: Date },
    signalDate: { type: Date, required: true, default: Date.now },
    closeResult: { type: String, enum: ["Win", "Loss", "Breakeven"] },
    closePnl: { type: String },
    exitPrice: { type: String },
    closedAt: { type: Date },
    isGoldSignal: { type: Boolean, default: false },
    entryStatus: {
      type: String,
      enum: ["PENDING", "FILLED", "HIT", "ACTIVE", "CANCELLED", "MOVED_TO_BE"],
      default: "FILLED",
    },
    stopLossStatus: {
      type: String,
      enum: ["PENDING", "FILLED", "HIT", "ACTIVE", "CANCELLED", "MOVED_TO_BE"],
      default: "ACTIVE",
    },
    tp1Status: {
      type: String,
      enum: ["PENDING", "FILLED", "HIT", "ACTIVE", "CANCELLED", "MOVED_TO_BE"],
      default: "PENDING",
    },
    tp2Status: {
      type: String,
      enum: ["PENDING", "FILLED", "HIT", "ACTIVE", "CANCELLED", "MOVED_TO_BE"],
      default: "PENDING",
    },
    tp3Status: {
      type: String,
      enum: ["PENDING", "FILLED", "HIT", "ACTIVE", "CANCELLED", "MOVED_TO_BE"],
      default: "PENDING",
    },
    tp1HitAt: { type: Date },
    tp2HitAt: { type: Date },
    tp3HitAt: { type: Date },
    proTip: { type: String, default: "" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export const SignalModel =
  mongoose.models.Signal || mongoose.model<ISignal>("Signal", SignalSchema);
