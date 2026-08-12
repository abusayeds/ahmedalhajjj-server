import { Document } from "mongoose";

export type SignalCategory = "Forex" | "Crypto" | "Commodity" | "Index";
export type SignalType = string;
export type SignalDirection = "BUY" | "SELL";
export type SignalStatus = "Active" | "Draft" | "Scheduled" | "Closed" | "Archived";

export type LevelStatus = "PENDING" | "FILLED" | "HIT" | "ACTIVE" | "CANCELLED" | "MOVED_TO_BE";

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
  exitPrice?: string;
  closedAt?: Date;
  isGoldSignal: boolean;
  entryStatus?: LevelStatus;
  stopLossStatus?: LevelStatus;
  tp1Status?: LevelStatus;
  tp2Status?: LevelStatus;
  tp3Status?: LevelStatus;
  tp1HitAt?: Date;
  tp2HitAt?: Date;
  tp3HitAt?: Date;
  proTip?: string;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
