import { SubscriptionModel } from "./subscription.model";

export const seedSubscriptions = async () => {
  const existingCount = await SubscriptionModel.countDocuments();

  if (existingCount === 0) {
    const subscriptions = [
      {
        name: "VIP",
        description: "Premium trading signals with all features",
        price: 79,
        billingCycle: "monthly",
        features: [
          "All signal types: Scalp, Swing, and Long-term",
          "Up to 10 signals per day (Forex & Crypto)",
          "Entry/Exit alerts with Stop-Loss protection",
          "Daily Gold (Metals) signals",
          "Advanced technical analysis reports",
          "Market sentiment analysis",
          "Economic calendar updates",
          "24/7 Premium Support",
          "Early access to new features",
          "Cancel anytime • No commitment required",
        ],
        maxSignalsPerDay: 10,
        includesGoldSignals: true,
        includesTechnicalAnalysis: true,
        includesMarketSentiment: true,
        includesEconomicCalendar: true,
        support: "premium",
        signalTypes: ["scalp", "swing", "long-term"],
        isActive: true,
      },
      {
        name: "Forex",
        description: "Professional Forex trading signals",
        price: 49,
        billingCycle: "monthly",
        features: [
          "Scalp and Swing signals",
          "Up to 5 daily signals",
          "3–5 Swing signals per week",
          "Daily Gold (Metals) signals",
          "Entry/Exit alerts with Stop-Loss protection",
          "Access to major Forex pairs",
          "Advanced support",
          "Cancel anytime • No commitment required",
        ],
        maxSignalsPerDay: 5,
        includesGoldSignals: true,
        includesTechnicalAnalysis: false,
        includesMarketSentiment: false,
        includesEconomicCalendar: false,
        support: "advanced",
        signalTypes: ["scalp", "swing"],
        isActive: true,
      },
      {
        name: "Crypto",
        description: "Cryptocurrency trading signals",
        price: 39,
        billingCycle: "monthly",
        features: [
          "Scalp and Swing signals",
          "Up to 5 daily signals",
          "3–5 Swing signals per week",
          "Real-time notifications",
          "Entry/Exit alerts with Stop-Loss protection",
          "Access to major Crypto pairs",
          "Advanced support",
          "Cancel anytime • No commitment required",
        ],
        maxSignalsPerDay: 5,
        includesGoldSignals: false,
        includesTechnicalAnalysis: false,
        includesMarketSentiment: false,
        includesEconomicCalendar: false,
        support: "advanced",
        signalTypes: ["scalp", "swing"],
        isActive: true,
      },
    ];

    await SubscriptionModel.insertMany(subscriptions);
    console.log("✓ Subscription plans seeded successfully");
  }
};
