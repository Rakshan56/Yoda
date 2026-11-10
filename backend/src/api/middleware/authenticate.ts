import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { AppError } from "../../lib/errors.js";
export const optionalAuth: RequestHandler = (req, _res, next) => {
  const token = req.header("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return next();
  try {
    req.auth = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
      userId: string;
      role: "USER" | "ADMIN";
    };
    next();
  } catch {
    next(
      new AppError(
        401,
        "UNAUTHENTICATED",
        "The access token is invalid or expired.",
      ),
    );
  }
};
export const authenticate: RequestHandler = (req, _res, next) => {
  optionalAuth(req, _res, (error) =>
    error
      ? next(error)
      : req.auth
        ? next()
        : next(
            new AppError(401, "UNAUTHENTICATED", "Authentication is required."),
          ),
  );
};
