import { Document } from "mongoose";

export type IPendingUser = {
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  password: string;
  confirmPassword?: string;
  role?: "user" | "admin";
} & Document;

export type IUser = {
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  address?: string;
  image?: {
    publicFileURL: string;
    path: string;
  };
  role: "admin" | "user";
  status?: "active" | "blocked";
  isDeleted: boolean;
  isVerify: boolean;
  currentSubscription?: string;
  subscriptionType?: "VIP" | "Forex" | "Crypto" | null;
  subscriptionStatus: "active" | "trial" | "expired" | "cancelled" | "none";
  subscriptionEndDate?: Date;
  freeTrialEndDate?: Date;
  hasUsedFreeAccess: boolean;
  promoAccessUsed?: boolean;
  verificationOrder?: number;
} & Document;

export type IOTP = {
  email: string;
  otp: string;
  expiresAt: Date;
} & Document;
