"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignalModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const SignalSchema = new mongoose_1.Schema({
    asset: { type: String, required: true, trim: true },
    category: {
        type: String,
        enum: ["Forex", "Crypto", "Commodity", "Index"],
        required: true,
    },
    type: { type: String, required: true, trim: true },
    direction: { type: String, enum: ["BUY", "SELL"], required: true },
    entry: { type: String, required: true },
    sl: { type: String, required: true },
    tp1: { type: String, required: true },
    tp2: { type: String, default: "—" },
    tp3: { type: String, default: "—" },
    notes: { type: String, default: "" },
    status: {
        type: String,
        enum: ["Active", "Draft", "Scheduled", "Closed", "Archived"],
        default: "Draft",
    },
    scheduledAt: { type: Date },
    publishedAt: { type: Date },
    signalDate: { type: Date, required: true, default: Date.now },
    closeResult: { type: String, enum: ["Win", "Loss", "Breakeven"] },
    closePnl: { type: String },
    isGoldSignal: { type: Boolean, default: false },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });
exports.SignalModel = mongoose_1.default.models.Signal || mongoose_1.default.model("Signal", SignalSchema);
