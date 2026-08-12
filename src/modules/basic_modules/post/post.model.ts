import mongoose, { Schema } from "mongoose";
import { IPost } from "./post.interface";

const PostSchema = new Schema<IPost>(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, default: "" },
    category: {
      type: String,
      enum: ["Market Update", "Education", "News", "Announcement"],
      required: true,
    },
    coverImage: { type: String, default: "" },
    likes: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    sharesCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Draft", "Published", "Scheduled"],
      default: "Draft",
    },
    scheduledAt: { type: Date },
    publishedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export const PostModel =
  mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);
