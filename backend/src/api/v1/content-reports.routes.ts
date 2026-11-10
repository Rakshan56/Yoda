import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { data } from "../../lib/response.js";
import { optionalAuth } from "../middleware/authenticate.js";
import { validate } from "../middleware/validate.js";

export const contentReportsRouter = Router();
const reportSchema = z.object({
  body: z.object({
    target_type: z.enum(["LOCATION", "ENCOUNTER", "WALKTHROUGH_CHAPTER", "BATTLE", "QUEST"]),
    target_id: z.string().min(1),
    reason: z.string().trim().min(1).max(100),
    description: z.string().trim().max(2000).optional(),
  }),
});

contentReportsRouter.post("/", optionalAuth, validate(reportSchema), async (req, res, next) => {
  try {
    const input = req.body as { target_type: string; target_id: string; reason: string; description?: string };
    const report = await prisma.contentReport.create({ data: { reporterId: req.auth?.userId, targetType: input.target_type, targetId: input.target_id, reason: input.reason, description: input.description } });
    return data(res, { id: report.id, status: report.status }, 201);
  } catch (error) { next(error); }
});
