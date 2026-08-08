import { Document } from "mongoose";

export type NotificationAudience =
  | "All Users"
  | "VIP Users"
  | "Forex Users"
  | "Crypto Users"
  | "Trial Users";

export type NotificationStatus = "Sent" | "Scheduled" | "Draft";

export interface INotification extends Document {
  title: string;
  message: string;
  audience: NotificationAudience;
  status: NotificationStatus;
  reach: number;
  opened: number;
  scheduledAt?: Date;
  sentAt?: Date;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
