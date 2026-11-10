import type { Response } from "express";
export const data = (res: Response, value: unknown, status = 200) =>
  res.status(status).json({ data: value });
export const page = (
  res: Response,
  value: unknown[],
  meta: Record<string, number>,
) => res.json({ data: value, meta });
