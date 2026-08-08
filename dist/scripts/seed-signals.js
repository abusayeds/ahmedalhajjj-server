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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const DB_1 = __importDefault(require("../DB"));
const signal_seed_1 = require("../modules/basic_modules/signal/signal.seed");
dotenv_1.default.config();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const url = process.env.DATABASE_URL;
        if (!url) {
            console.error("DATABASE_URL is not set");
            process.exit(1);
        }
        yield mongoose_1.default.connect(url);
        console.log("MongoDB connected");
        yield (0, DB_1.default)();
        yield (0, signal_seed_1.seedSignals)();
        yield mongoose_1.default.disconnect();
        console.log("Done.");
    });
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
