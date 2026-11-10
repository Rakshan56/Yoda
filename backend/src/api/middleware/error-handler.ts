import type { ErrorRequestHandler, RequestHandler } from "express";
import { AppError } from "../../lib/errors.js";
import { logger } from "../../config/logger.js";
export const notFoundHandler: RequestHandler = (req, _res, next) =>
  next(
    new AppError(
      404,
      "RESOURCE_NOT_FOUND",
      `No route for ${req.method} ${req.path}`,
    ),
  );
export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  const appError = error instanceof AppError ? error : undefined;
  if (!appError)
    logger.error(
      { err: error, requestId: req.requestId },
      "Unhandled request error",
    );
  res.status(appError?.status ?? 500).json({
    error: {
      code: appError?.code ?? "INTERNAL_SERVER_ERROR",
      message: appError?.message ?? "An unexpected error occurred.",
      details: appError?.details ?? [],
      request_id: req.requestId,
    },
  });
};
