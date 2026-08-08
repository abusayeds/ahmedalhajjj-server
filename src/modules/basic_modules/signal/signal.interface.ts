import { Document } from "mongoose";

export type SignalCategory = "Forex" | "Crypto" | "Commodity" | "Index";
export type SignalType = string;
export type SignalDirection = "BUY" | "SELL";
export type SignalStatus = "Active" | "Draft" | "Scheduled" | "Closed" | "Archived";

export interface ISignal extends Document {
  asset: string;
  category: SignalCategory;
  type: SignalType;
  direction: SignalDirection;
  entry: string;
  sl: string;
  tp1: string;
  tp2?: string;
  tp3?: string;
  notes?: string;
  status: SignalStatus;
  scheduledAt?: Date;
  publishedAt?: Date;
  signalDate: Date;
  closeResult?: "Win" | "Loss" | "Breakeven";
  closePnl?: string;
  isGoldSignal: boolean;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
