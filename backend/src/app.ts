import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { apiRouter } from "./api/v1/router.js";
import { frontendOrigins } from "./config/env.js";
import { prisma } from "./lib/prisma.js";
import { requestId } from "./api/middleware/request-id.js";
import { apiRateLimit } from "./api/middleware/rate-limit.js";
import {
  errorHandler,
  notFoundHandler,
} from "./api/middleware/error-handler.js";
import { csrfProtection } from "./api/middleware/csrf.js";
export const app = express();
app.disable("x-powered-by");
app.set("trust proxy", false);
app.use(helmet());
app.use(cors({ origin: frontendOrigins, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(requestId);
app.use(csrfProtection);
app.get("/health/live", (_req, res) => res.json({ data: { status: "ok" } }));
app.get("/health/ready", async (_req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ data: { status: "ready" } });
  } catch (error) {
    next(error);
  }
});
app.use("/api/v1", apiRateLimit, apiRouter);
app.get("/openapi.json", (_req, res) =>
  res.sendFile("openapi.json", {
    root: new URL("../docs", import.meta.url).pathname,
  }),
);
app.get("/docs", (_req, res) =>
  res
    .type("html")
    .send(
      '<!doctype html><title>Yoda API</title><p>OpenAPI specification: <a href="/openapi.json">/openapi.json</a></p>',
    ),
);
app.use(notFoundHandler);
app.use(errorHandler);
