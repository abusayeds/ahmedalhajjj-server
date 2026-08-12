import mongoose, { Schema } from "mongoose";

const NotificationReadSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    notificationId: {
      type: Schema.Types.ObjectId,
      ref: "Notification",
      required: true,
      index: true,
    },
    readAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

NotificationReadSchema.index({ userId: 1, notificationId: 1 }, { unique: true });

export const NotificationReadModel =
  mongoose.models.NotificationRead ||
  mongoose.model("NotificationRead", NotificationReadSchema);
