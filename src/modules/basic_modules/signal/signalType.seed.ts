import { SignalTypeModel } from "./signalType.model";

const DEFAULT_SIGNAL_TYPES = ["Scalp", "Swing", "Intraday", "Position", "Long-term"];

export const seedSignalTypes = async () => {
  const existingCount = await SignalTypeModel.countDocuments();
  if (existingCount > 0) return;

  await SignalTypeModel.insertMany(
    DEFAULT_SIGNAL_TYPES.map((name) => ({ name, isActive: true })),
  );

  console.log("✓ Signal types seeded successfully");
};
