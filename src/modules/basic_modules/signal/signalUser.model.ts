import mongoose, { Schema } from "mongoose";

const SignalFavoriteSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    signalId: { type: Schema.Types.ObjectId, ref: "Signal", required: true, index: true },
  },
  { timestamps: true },
);

SignalFavoriteSchema.index({ userId: 1, signalId: 1 }, { unique: true });

export const SignalFavoriteModel =
  mongoose.models.SignalFavorite ||
  mongoose.model("SignalFavorite", SignalFavoriteSchema);

const SignalAlertSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    signalId: { type: Schema.Types.ObjectId, ref: "Signal", required: true, index: true },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true },
);

SignalAlertSchema.index({ userId: 1, signalId: 1 }, { unique: true });

export const SignalAlertModel =
  mongoose.models.SignalAlert ||
  mongoose.model("SignalAlert", SignalAlertSchema);
