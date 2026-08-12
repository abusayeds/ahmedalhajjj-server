import mongoose, { Schema } from "mongoose";
import { IPostComment } from "./post.interface";

const PostCommentSchema = new Schema<IPostComment>(
  {
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    text: { type: String, required: true, trim: true },
    likes: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const PostCommentModel =
  mongoose.models.PostComment ||
  mongoose.model<IPostComment>("PostComment", PostCommentSchema);

const PostLikeSchema = new Schema(
  {
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true },
);

PostLikeSchema.index({ postId: 1, userId: 1 }, { unique: true });

export const PostLikeModel =
  mongoose.models.PostLike || mongoose.model("PostLike", PostLikeSchema);

const PostCommentLikeSchema = new Schema(
  {
    commentId: { type: Schema.Types.ObjectId, ref: "PostComment", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true },
);

PostCommentLikeSchema.index({ commentId: 1, userId: 1 }, { unique: true });

export const PostCommentLikeModel =
  mongoose.models.PostCommentLike ||
  mongoose.model("PostCommentLike", PostCommentLikeSchema);
