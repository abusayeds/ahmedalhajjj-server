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
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const user_model_1 = require("../modules/basic_modules/user/user.model");
const authMiddleware = (...requiredRoles) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return next(new AppError_1.default(http_status_1.default.UNAUTHORIZED, "No token provided or invalid format."));
        }
        const token = authHeader.split(" ")[1];
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET_KEY);
            const userId = decoded._id || decoded.id || (decoded.user && (decoded.user._id || decoded.user.id));
            const role = decoded.role || (decoded.user && decoded.user.role);
            const user = yield user_model_1.UserModel.findById(userId);
            if (requiredRoles && requiredRoles.length > 0 && role && !requiredRoles.includes(role)) {
                return next(new AppError_1.default(http_status_1.default.UNAUTHORIZED, `You are not authorized.`));
            }
            if (!user) {
                return next(new AppError_1.default(http_status_1.default.UNAUTHORIZED, "User not found or unauthorized."));
            }
            req.user = user;
            next();
        }
        catch (error) {
            return next(new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Invalid token!"));
        }
    });
};
exports.authMiddleware = authMiddleware;
// import { Request, Response, NextFunction } from "express";
// import jwt from "jsonwebtoken";
// // Extend the Express Request type to include the user property
// interface AuthRequest extends Request {
//   user?: jwt.JwtPayload | string;
// }
// type Role = "admin" | "user";
// export const authMiddleware = (role?: Role) => {
//   return (req: AuthRequest, res: Response, next: NextFunction) => {
//     const token = req.headers.authorization?.split(" ")[1];
//     if (!token) {
//       return res
//         .status(401)
//         .json({ success: false, message: "Access denied. No token provided." });
//     }
//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string);
//       req.user = decoded; // Attach user data to request object
//       // Check if the user is admin
//       if (role && (req.user as jwt.JwtPayload)?.role === "admin") {
//         return next();
//       }
//       // Check if the user has the required role
//       if (role && (req.user as jwt.JwtPayload).role !== role) {
//         return res.status(403).json({
//           success: false,
//           message: "You are not authorized",
//         });
//       }
//       next();
//     } catch (error) {
//       res.status(400).json({ success: false, message: "Invalid token!" });
//     }
//   };
// };
