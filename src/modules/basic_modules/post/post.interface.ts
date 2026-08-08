import { Document } from "mongoose";

export type PostCategory = "Market Update" | "Education" | "News" | "Announcement";
export type PostStatus = "Draft" | "Published" | "Scheduled";

export interface IPost extends Document {
  title: string;
  body: string;
  category: PostCategory;
  coverImage?: string;
  likes: number;
  commentsCount: number;
  status: PostStatus;
  scheduledAt?: Date;
  publishedAt?: Date;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
