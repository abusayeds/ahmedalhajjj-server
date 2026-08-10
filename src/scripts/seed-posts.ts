import mongoose from "mongoose";
import dotenv from "dotenv";
import seedSuperAdmin from "../DB";
import { seedPosts } from "../modules/basic_modules/post/post.seed";

dotenv.config();

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  await mongoose.connect(url);
  console.log("MongoDB connected");

  await seedSuperAdmin();
  await seedPosts();

  await mongoose.disconnect();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
