import { timingSafeEqual } from "node:crypto";
import type { RequestHandler } from "express";
import { AppError } from "../../lib/errors.js";

const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);

export const csrfProtection: RequestHandler = (req, _res, next) => {
  if (safeMethods.has(req.method) || !req.cookies?.yoda_refresh_token)
    return next();
  const cookieToken = req.cookies.yoda_csrf_token;
  const headerToken = req.header("x-csrf-token");
  if (!cookieToken || !headerToken)
    return next(
      new AppError(403, "FORBIDDEN", "A valid CSRF token is required."),
    );
  const expected = Buffer.from(cookieToken);
  const supplied = Buffer.from(headerToken);
  if (
    expected.length !== supplied.length ||
    !timingSafeEqual(expected, supplied)
  ) {
    return next(
      new AppError(403, "FORBIDDEN", "A valid CSRF token is required."),
    );
  }
  next();
};
