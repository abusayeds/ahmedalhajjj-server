import mongoose, { Schema } from "mongoose";
import { INotification } from "./notification.interface";

const NotificationSchema = new Schema<INotification>(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    audience: {
      type: String,
      enum: ["All Users", "VIP Users", "Forex Users", "Crypto Users", "Trial Users"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Sent", "Scheduled", "Draft"],
      default: "Sent",
    },
    reach: { type: Number, default: 0 },
    opened: { type: Number, default: 0 },
    scheduledAt: { type: Date },
    sentAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export const NotificationModel =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);
