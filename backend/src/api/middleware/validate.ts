import type { RequestHandler } from "express";
import { z } from "zod";
import { AppError } from "../../lib/errors.js";
export const validate =
  (schema: z.ZodType): RequestHandler =>
  (req, _res, next) => {
    const result = schema.safeParse({
      params: req.params,
      query: req.query,
      body: req.body,
    }) as {
      success: boolean;
      data?: { params?: unknown; query?: unknown; body?: unknown };
      error?: { issues: unknown[] };
    };
    if (!result.success)
      return next(
        new AppError(
          422,
          "VALIDATION_ERROR",
          "Request validation failed.",
          result.error?.issues ?? [],
        ),
      );
    const parsed = result.data ?? {};
    if (parsed.params !== undefined)
      req.params = parsed.params as typeof req.params;
    if (parsed.query !== undefined) {
      Object.defineProperty(req, "query", {
        configurable: true,
        enumerable: true,
        writable: true,
        value: parsed.query
      });
    }
    if ("body" in parsed) req.body = parsed.body;
    next();
  };
