import type { RequestHandler } from "express";
import { AppError } from "../../lib/errors.js";
export const authorize =
  (...roles: Array<"USER" | "ADMIN">): RequestHandler =>
  (req, _res, next) => {
    if (!req.auth || !roles.includes(req.auth.role))
      return next(
        new AppError(
          403,
          "FORBIDDEN",
          "You do not have permission to perform this action.",
        ),
      );
    next();
  };
