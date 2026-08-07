export interface ICoupon {
  _id?: string;
  code: string;
  discount: string | number;
  discountType?: "percentage" | "fixed";
  expiry?: string | Date;
  expiryDate?: Date;
  limit: number;
  used: number;
  usedCount?: number;
  status: "Active" | "Inactive" | "Exhausted" | "Expired";
  applicablePlans?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
