import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { TRole } from "../utils/role";
import AppError from "../errors/AppError";
import httpStatus from "http-status";
import { UserModel } from "../modules/basic_modules/user/user.model";
import { IUser } from "../modules/basic_modules/user/user.interface";

export interface AuthRequest extends Request {
  user?: IUser;
}


export const authMiddleware = (...requiredRoles: TRole[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new AppError(httpStatus.UNAUTHORIZED, "No token provided or invalid format."));
    }
    const token = authHeader.split(" ")[1];
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET_KEY as string);
      const userId = decoded._id || decoded.id || (decoded.user && (decoded.user._id || decoded.user.id));
      const role = decoded.role || (decoded.user && decoded.user.role);

      const user: IUser | null = await UserModel.findById(userId);
      if (requiredRoles && requiredRoles.length > 0 && role && !requiredRoles.includes(role)) {
        return next(new AppError(httpStatus.UNAUTHORIZED, `You are not authorized.`));
      }
      if (!user) {
        return next(new AppError(httpStatus.UNAUTHORIZED, "User not found or unauthorized."));
      }
      req.user = user;
      next();
    } catch (error) {
      return next(new AppError(httpStatus.UNAUTHORIZED, "Invalid token!"));
    }
  };
};





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



