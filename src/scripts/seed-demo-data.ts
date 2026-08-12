import mongoose from "mongoose";
import dotenv from "dotenv";
import seedSuperAdmin from "../DB";
import { UserModel } from "../modules/basic_modules/user/user.model";
import { PurchaseModel } from "../modules/basic_modules/subscription/subscription.model";
import { PostModel } from "../modules/basic_modules/post/post.model";
import { PostCommentModel } from "../modules/basic_modules/post/postComment.model";
import { SignalModel } from "../modules/basic_modules/signal/signal.model";
import { NotificationModel } from "../modules/basic_modules/notification/notification.model";
import { CouponModel } from "../modules/basic_modules/coupon/coupon.model";

dotenv.config();
const SEED_MARKER = "[DEMO]";
const PASSWORD = "1qazxsw2";
const DEMO_USERS = [
  { email: "ahmed.user@gmail.com", firstName: "Ahmed", lastName: "Hassan" },
  { email: "fatima.user@gmail.com", firstName: "Fatima", lastName: "Ali" },
  { email: "omar.user@gmail.com", firstName: "Omar", lastName: "Khan" },
  { email: "sara.user@gmail.com", firstName: "Sara", lastName: "Ahmed" },
  { email: "yusuf.user@gmail.com", firstName: "Yusuf", lastName: "Malik" },
  { email: "aisha.user@gmail.com", firstName: "Aisha", lastName: "Rahman" },
  { email: "karim.user@gmail.com", firstName: "Karim", lastName: "Chowdhury" },
];

const dayAt = (offsetDays: number, hour = 10, minute = 0) => {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  return d;
};

const minutesAgo = (mins: number) => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - mins);
  return d;
};

const seedDemoUsers = async () => {
  for (let i = 0; i < DEMO_USERS.length; i += 1) {
    const demo = DEMO_USERS[i];

    let user = await UserModel.findOne({ email: demo.email });
    if (!user) {
      user = await UserModel.create({
        firstName: demo.firstName,
        lastName: demo.lastName,
        name: `${demo.firstName} ${demo.lastName}`,
        email: demo.email,
        password: PASSWORD,
        phone: `0170000000${i + 1}`,
        role: "user",
        isVerify: true,
        isDeleted: false,
        status: "active",
        subscriptionType: null,
        subscriptionStatus: "none",
        hasUsedFreeAccess: false,
        promoAccessUsed: false,
      });
      console.log(`  + User: ${demo.email}`);
    } else {
    await UserModel.findByIdAndUpdate(user._id, {
        firstName: demo.firstName,
        lastName: demo.lastName,
        name: `${demo.firstName} ${demo.lastName}`,
        isVerify: true,
        isDeleted: false,
        status: "active",
        subscriptionType: null,
        subscriptionStatus: "none",
        currentSubscription: null,
        subscriptionEndDate: null,
        freeTrialEndDate: null,
        hasUsedFreeAccess: false,
        promoAccessUsed: false,
        verificationOrder: i + 1,
      });
      console.log(`  ~ User: ${demo.email}`);
    }

    await PurchaseModel.deleteMany({ userId: user._id });
  }

  console.log(`✓ ${DEMO_USERS.length} demo users ready (password: ${PASSWORD}, no plan assigned)`);
};

const seedDemoPosts = async (adminId: mongoose.Types.ObjectId | undefined) => {
  await PostModel.deleteMany({ body: { $regex: SEED_MARKER } });

  const posts = [
    {
      title: "Bitcoin Reclaims Key $67K Level",
      body: `${SEED_MARKER} Bitcoin reclaimed $67,000 after consolidation. Volume confirms bullish momentum toward $69,500 resistance.`,
      category: "Market Update",
      coverImage:
        "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&h=480&fit=crop&auto=format",
      likes: 142,
      commentsCount: 2,
      sharesCount: 34,
      status: "Published",
      publishedAt: dayAt(-1, 9, 15),
      createdBy: adminId,
    },
    {
      title: "Understanding Risk-to-Reward Ratios",
      body: `${SEED_MARKER} A 1:2 risk-to-reward ratio means risking $100 to target $200. Consistent R:R protects capital during losing streaks.`,
      category: "Education",
      coverImage:
        "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=480&fit=crop&auto=format",
      likes: 89,
      commentsCount: 2,
      sharesCount: 21,
      status: "Published",
      publishedAt: dayAt(-2, 11, 30),
      createdBy: adminId,
    },
    {
      title: "Fed Signals No Rate Cuts Before Q4",
      body: `${SEED_MARKER} The Fed indicated rate cuts are unlikely before Q4. Expect volatility in Forex and gold around US data releases.`,
      category: "News",
      coverImage:
        "https://images.unsplash.com/photo-1591033594798-33227a05780d?w=1200&h=480&fit=crop&auto=format",
      likes: 67,
      commentsCount: 0,
      sharesCount: 18,
      status: "Published",
      publishedAt: dayAt(-3, 14, 0),
      createdBy: adminId,
    },
    {
      title: "Premium Signal Alerts — Now Live",
      body: `${SEED_MARKER} Premium push alerts are live. Subscribers get entry, SL, and TP levels for Forex and Crypto signals in real time.`,
      category: "Announcement",
      coverImage:
        "https://images.unsplash.com/photo-1605792657660-596af9009e82?w=1200&h=480&fit=crop&auto=format",
      likes: 203,
      commentsCount: 0,
      sharesCount: 52,
      status: "Published",
      publishedAt: dayAt(0, 8, 45),
      createdBy: adminId,
    },
    {
      title: "Gold Holds Above $2,340 Support",
      body: `${SEED_MARKER} XAU/USD is holding above $2,340 as safe-haven demand stays firm. Watch the NY session for breakout confirmation.`,
      category: "Market Update",
      coverImage:
        "https://images.unsplash.com/photo-1610375461245-097f13019e6e?w=1200&h=480&fit=crop&auto=format",
      likes: 118,
      commentsCount: 0,
      sharesCount: 27,
      status: "Published",
      publishedAt: dayAt(0, 12, 0),
      createdBy: adminId,
    },
    {
      title: "How to Read Economic Calendar Events",
      body: `${SEED_MARKER} High-impact events (NFP, CPI, FOMC) move markets fast. Reduce size or wait for volatility to settle before entering.`,
      category: "Education",
      coverImage:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=480&fit=crop&auto=format",
      likes: 54,
      commentsCount: 0,
      sharesCount: 11,
      status: "Published",
      publishedAt: dayAt(-1, 16, 30),
      createdBy: adminId,
    },
  ];

  const insertedPosts = await PostModel.insertMany(posts);
  console.log(`✓ ${posts.length} demo posts seeded`);
  return insertedPosts;
};

const seedDemoPostComments = async () => {
  const educationPost = await PostModel.findOne({
    body: { $regex: SEED_MARKER },
    title: /Risk-to-Reward/i,
  });
  const ahmed = await UserModel.findOne({ email: "ahmed.user@gmail.com" });
  const fatima = await UserModel.findOne({ email: "fatima.user@gmail.com" });

  if (!educationPost || !ahmed || !fatima) {
    return;
  }

  await PostCommentModel.deleteMany({ postId: educationPost._id });

  await PostCommentModel.insertMany([
    {
      postId: educationPost._id,
      userId: ahmed._id,
      text: "R:R is the most underrated concept in trading. Changed my whole approach.",
      likes: 15,
      createdAt: minutesAgo(38),
    },
    {
      postId: educationPost._id,
      userId: fatima._id,
      text: "Great reminder. I always move SL to BE after TP1 now.",
      likes: 9,
      createdAt: minutesAgo(75),
    },
  ]);

  await PostModel.findByIdAndUpdate(educationPost._id, { commentsCount: 2 });
  console.log("✓ Demo post comments seeded");
};

const seedDemoSignals = async (adminId: mongoose.Types.ObjectId | undefined) => {
  await SignalModel.deleteMany({ notes: { $regex: SEED_MARKER } });

  const today = dayAt(0);
  const yesterday = dayAt(-1);

  const signals = [
    {
      asset: "BTC/USDT",
      category: "Crypto",
      type: "Scalp",
      direction: "BUY",
      entry: "67250",
      sl: "66800",
      tp1: "67800",
      tp2: "68500",
      notes: `${SEED_MARKER} Today — BTC breakout above 4H range.`,
      status: "Active",
      publishedAt: dayAt(0, 8, 0),
      signalDate: today,
      createdBy: adminId,
    },
    {
      asset: "EUR/USD",
      category: "Forex",
      type: "Scalp",
      direction: "BUY",
      entry: "1.0842",
      sl: "1.0825",
      tp1: "1.0860",
      tp2: "1.0875",
      notes: `${SEED_MARKER} Today — bullish H1 momentum into US session.`,
      status: "Active",
      publishedAt: dayAt(0, 9, 30),
      signalDate: today,
      createdBy: adminId,
    },
    {
      asset: "XAU/USD",
      category: "Commodity",
      type: "Swing",
      direction: "BUY",
      entry: "2348.50",
      sl: "2335.00",
      tp1: "2365.00",
      tp2: "2380.00",
      notes: `${SEED_MARKER} Today — gold safe-haven bid.`,
      status: "Active",
      publishedAt: dayAt(0, 7, 15),
      signalDate: today,
      isGoldSignal: true,
      createdBy: adminId,
    },
    {
      asset: "GBP/JPY",
      category: "Forex",
      type: "Swing",
      direction: "SELL",
      entry: "198.450",
      sl: "199.100",
      tp1: "197.800",
      tp2: "197.200",
      notes: `${SEED_MARKER} Today — rejection at daily resistance.`,
      status: "Active",
      publishedAt: dayAt(0, 10, 0),
      signalDate: today,
      createdBy: adminId,
    },
    {
      asset: "ETH/USDT",
      category: "Crypto",
      type: "Swing",
      direction: "SELL",
      entry: "3420",
      sl: "3520",
      tp1: "3320",
      tp2: "3250",
      notes: `${SEED_MARKER} Yesterday — double top on daily.`,
      status: "Active",
      publishedAt: dayAt(-1, 11, 0),
      signalDate: yesterday,
      createdBy: adminId,
    },
    {
      asset: "USD/JPY",
      category: "Forex",
      type: "Scalp",
      direction: "SELL",
      entry: "157.80",
      sl: "158.20",
      tp1: "157.20",
      tp2: "156.80",
      notes: `${SEED_MARKER} Yesterday — yen strength after BoJ headlines.`,
      status: "Active",
      publishedAt: dayAt(-1, 8, 45),
      signalDate: yesterday,
      createdBy: adminId,
    },
    {
      asset: "SOL/USDT",
      category: "Crypto",
      type: "Scalp",
      direction: "BUY",
      entry: "178.50",
      sl: "174.00",
      tp1: "185.00",
      notes: `${SEED_MARKER} Yesterday — altcoin bounce with BTC.`,
      status: "Active",
      publishedAt: dayAt(-1, 14, 30),
      signalDate: yesterday,
      createdBy: adminId,
    },
    {
      asset: "US30",
      category: "Index",
      type: "Swing",
      direction: "BUY",
      entry: "39250",
      sl: "39080",
      tp1: "39420",
      tp2: "39600",
      notes: `${SEED_MARKER} Yesterday — index held 50 EMA on daily.`,
      status: "Active",
      publishedAt: dayAt(-1, 15, 45),
      signalDate: yesterday,
      createdBy: adminId,
    },
    {
      asset: "NAS100",
      category: "Index",
      type: "Scalp",
      direction: "BUY",
      entry: "19840.00",
      sl: "19680.00",
      tp1: "20240.00",
      exitPrice: "20240.00",
      notes: `${SEED_MARKER} Closed winner — index breakout continuation.`,
      status: "Closed",
      closeResult: "Win",
      closePnl: "+2.02%",
      publishedAt: dayAt(-5, 10, 0),
      signalDate: dayAt(-5),
      closedAt: dayAt(-3, 19, 12),
      createdBy: adminId,
    },
    {
      asset: "USD/CAD",
      category: "Forex",
      type: "Scalp",
      direction: "SELL",
      entry: "1.3620",
      sl: "1.3655",
      tp1: "1.3585",
      exitPrice: "1.3655",
      notes: `${SEED_MARKER} Closed loss — oil spike stopped the trade.`,
      status: "Closed",
      closeResult: "Loss",
      closePnl: "-1.22%",
      publishedAt: dayAt(-4, 9, 0),
      signalDate: dayAt(-4),
      closedAt: dayAt(-4, 18, 0),
      createdBy: adminId,
    },
    {
      asset: "ETH/USDT",
      category: "Crypto",
      type: "Swing",
      direction: "BUY",
      entry: "3200",
      sl: "3100",
      tp1: "3345",
      exitPrice: "3345",
      notes: `${SEED_MARKER} Closed winner — swing target reached.`,
      status: "Closed",
      closeResult: "Win",
      closePnl: "+0.45%",
      publishedAt: dayAt(-6, 11, 0),
      signalDate: dayAt(-6),
      closedAt: dayAt(-5, 14, 0),
      createdBy: adminId,
    },
    {
      asset: "GBP/JPY",
      category: "Forex",
      type: "Swing",
      direction: "SELL",
      entry: "198.100",
      sl: "199.000",
      tp1: "196.800",
      exitPrice: "198.100",
      notes: `${SEED_MARKER} Closed breakeven — manually closed at entry.`,
      status: "Closed",
      closeResult: "Breakeven",
      closePnl: "0%",
      publishedAt: dayAt(-7, 8, 0),
      signalDate: dayAt(-7),
      closedAt: dayAt(-6, 20, 0),
      createdBy: adminId,
    },
    {
      asset: "XAU/USD",
      category: "Commodity",
      type: "Swing",
      direction: "BUY",
      entry: "2320.00",
      sl: "2305.00",
      tp1: "2365.00",
      exitPrice: "2365.00",
      notes: `${SEED_MARKER} Closed winner — gold safe-haven rally.`,
      status: "Closed",
      closeResult: "Win",
      closePnl: "+1.94%",
      isGoldSignal: true,
      publishedAt: dayAt(-8, 7, 0),
      signalDate: dayAt(-8),
      closedAt: dayAt(-7, 16, 0),
      createdBy: adminId,
    },
    {
      asset: "AUD/USD",
      category: "Forex",
      type: "Scalp",
      direction: "BUY",
      entry: "0.6580",
      sl: "0.6540",
      tp1: "0.6620",
      exitPrice: "0.6540",
      notes: `${SEED_MARKER} Closed loss — RBA surprise headline.`,
      status: "Closed",
      closeResult: "Loss",
      closePnl: "-0.61%",
      publishedAt: dayAt(-9, 12, 0),
      signalDate: dayAt(-9),
      closedAt: dayAt(-8, 9, 0),
      createdBy: adminId,
    },
    {
      asset: "BTC/USDT",
      category: "Crypto",
      type: "Scalp",
      direction: "BUY",
      entry: "65000",
      sl: "64200",
      tp1: "66800",
      exitPrice: "66800",
      notes: `${SEED_MARKER} Closed winner — BTC momentum continuation.`,
      status: "Closed",
      closeResult: "Win",
      closePnl: "+2.77%",
      publishedAt: dayAt(-10, 6, 0),
      signalDate: dayAt(-10),
      closedAt: dayAt(-9, 22, 0),
      createdBy: adminId,
    },
  ];

  await SignalModel.insertMany(signals);
  console.log(`✓ ${signals.length} demo signals seeded (8 active + 7 closed history)`);
};

const seedDemoCoupons = async () => {
  const coupons = [
    {
      code: "WELCOME20",
      discount: 20,
      discountType: "percentage",
      expiry: "2026-12-31",
      expiryDate: new Date("2026-12-31"),
      limit: 500,
      used: 12,
      status: "Active",
      applicablePlans: ["VIP", "Forex", "Crypto"],
    },
    {
      code: "FOREX15",
      discount: 15,
      discountType: "percentage",
      expiry: "2026-09-30",
      expiryDate: new Date("2026-09-30"),
      limit: 200,
      used: 5,
      status: "Active",
      applicablePlans: ["Forex"],
    },
    {
      code: "CRYPTO10",
      discount: 10,
      discountType: "percentage",
      expiry: "2026-10-15",
      expiryDate: new Date("2026-10-15"),
      limit: 150,
      used: 3,
      status: "Active",
      applicablePlans: ["Crypto"],
    },
    {
      code: "FLAT5USD",
      discount: 5,
      discountType: "fixed",
      expiry: "2026-08-31",
      expiryDate: new Date("2026-08-31"),
      limit: 100,
      used: 0,
      status: "Active",
      applicablePlans: ["VIP", "Forex", "Crypto"],
    },
    {
      code: "OLDCODE50",
      discount: 50,
      discountType: "percentage",
      expiry: "2025-01-01",
      expiryDate: new Date("2025-01-01"),
      limit: 50,
      used: 50,
      status: "Expired",
      applicablePlans: ["VIP"],
    },
  ];

  for (const coupon of coupons) {
    await CouponModel.findOneAndUpdate({ code: coupon.code }, coupon, { upsert: true, new: true });
  }

  console.log(`✓ ${coupons.length} demo coupons seeded`);
};

const seedDemoNotifications = async (adminId: mongoose.Types.ObjectId | undefined) => {
  await NotificationModel.deleteMany({ message: { $regex: SEED_MARKER } });

  const notifications = [
    {
      title: "New BTC Scalp Signal Live",
      message: `${SEED_MARKER} BTC/USDT BUY signal is active. Check the app for entry, SL, and TP levels.`,
      audience: "All Users",
      status: "Sent",
      reach: 1240,
      opened: 892,
      sentAt: dayAt(0, 8, 5),
      createdBy: adminId,
    },
    {
      title: "Premium Forex Alert",
      message: `${SEED_MARKER} EUR/USD and GBP/JPY signals published for VIP and Forex subscribers.`,
      audience: "Forex Users",
      status: "Sent",
      reach: 680,
      opened: 421,
      sentAt: dayAt(0, 9, 35),
      createdBy: adminId,
    },
    {
      title: "Crypto Swing Update",
      message: `${SEED_MARKER} ETH/USDT SELL setup from yesterday remains valid. Manage risk accordingly.`,
      audience: "Crypto Users",
      status: "Sent",
      reach: 520,
      opened: 310,
      sentAt: dayAt(-1, 11, 15),
      createdBy: adminId,
    },
    {
      title: "Trial Ending Soon",
      message: `${SEED_MARKER} Your free trial ends in 7 days. Upgrade to keep full signal access.`,
      audience: "Trial Users",
      status: "Sent",
      reach: 340,
      opened: 198,
      sentAt: dayAt(-1, 10, 0),
      createdBy: adminId,
    },
    {
      title: "Weekly Market Outlook",
      message: `${SEED_MARKER} Scheduled push: Fed week ahead — reduced position size recommended.`,
      audience: "VIP Users",
      status: "Scheduled",
      reach: 0,
      opened: 0,
      scheduledAt: dayAt(1, 9, 0),
      createdBy: adminId,
    },
    {
      title: "App Maintenance Draft",
      message: `${SEED_MARKER} Draft notice for planned maintenance window next Sunday.`,
      audience: "All Users",
      status: "Draft",
      reach: 0,
      opened: 0,
      createdBy: adminId,
    },
  ];

  await NotificationModel.insertMany(notifications);
  console.log(`✓ ${notifications.length} demo notifications seeded`);
};

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  await mongoose.connect(url);
  console.log("MongoDB connected\n");

  await seedSuperAdmin();

  const admin = await UserModel.findOne({ role: "admin" }).select("_id");
  const adminId = admin?._id as mongoose.Types.ObjectId | undefined;

  console.log("Seeding demo users...");
  await seedDemoUsers();

  console.log("Seeding demo posts...");
  await seedDemoPosts(adminId);
  await seedDemoPostComments();

  console.log("Seeding demo signals...");
  await seedDemoSignals(adminId);

  console.log("Seeding demo coupons...");
  await seedDemoCoupons();

  console.log("Seeding demo notifications...");
  await seedDemoNotifications(adminId);

  await mongoose.disconnect();
  console.log("\nDone. Login with any demo user using password:", PASSWORD);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
