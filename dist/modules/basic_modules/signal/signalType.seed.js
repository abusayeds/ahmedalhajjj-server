"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedSignalTypes = void 0;
const signalType_model_1 = require("./signalType.model");
const DEFAULT_SIGNAL_TYPES = ["Scalp", "Swing", "Intraday", "Position", "Long-term"];
const seedSignalTypes = () => __awaiter(void 0, void 0, void 0, function* () {
    const existingCount = yield signalType_model_1.SignalTypeModel.countDocuments();
    if (existingCount > 0)
        return;
    yield signalType_model_1.SignalTypeModel.insertMany(DEFAULT_SIGNAL_TYPES.map((name) => ({ name, isActive: true })));
    console.log("✓ Signal types seeded successfully");
});
exports.seedSignalTypes = seedSignalTypes;
