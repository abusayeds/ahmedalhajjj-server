import { Document } from "mongoose";

export interface ISignalType extends Document {
  name: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
