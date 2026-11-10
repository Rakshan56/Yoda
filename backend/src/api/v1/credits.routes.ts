import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { data } from "../../lib/response.js";
import { validate } from "../middleware/validate.js";
import { gameId } from "../schemas/common.js";

export const creditsRouter = Router();

const credits = async (game?: string) => {
  const sources = await prisma.sourceRegistry.findMany({
    where: game ? { contentSources: { some: { gameId: game } } } : undefined,
    select: { id: true, name: true, url: true, organization: true, licenseNotes: true, creditText: true, retrievedAt: true },
    orderBy: { name: "asc" },
  });
  return {
    game_id: game ?? null,
    sources: sources.map((source) => ({
      source_id: source.id,
      name: source.name,
      url: source.url,
      organization: source.organization,
      license_notes: source.licenseNotes,
      credit_text: source.creditText,
      retrieved_at: source.retrievedAt,
    })),
  };
};

creditsRouter.get("/", async (_req, res, next) => {
  try { return data(res, await credits()); } catch (error) { next(error); }
});
creditsRouter.get("/:gameId/credits", validate(z.object({ params: z.object({ gameId }) })), async (req, res, next) => {
  try { return data(res, await credits(String(req.params.gameId))); } catch (error) { next(error); }
});
