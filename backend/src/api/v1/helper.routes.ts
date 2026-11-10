import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { data } from "../../lib/response.js";
import { AppError } from "../../lib/errors.js";
import { authenticate } from "../middleware/authenticate.js";
import { validate } from "../middleware/validate.js";
import { gameId } from "../schemas/common.js";

export const helperRouter = Router();
helperRouter.use(authenticate);
const conversationParams = z.object({ params: z.object({ conversationId: z.string().uuid() }) });
const createSchema = z.object({ body: z.object({ game_id: gameId.optional(), title: z.string().trim().max(100).optional() }) });
const messageSchema = z.object({ params: z.object({ conversationId: z.string().uuid() }), body: z.object({ content: z.string().trim().min(1).max(4000) }) });

helperRouter.get("/conversations", async (req, res, next) => {
  try { return data(res, await prisma.helperConversation.findMany({ where: { userId: req.auth!.userId }, include: { messages: { orderBy: { createdAt: "asc" } } }, orderBy: { updatedAt: "desc" } })); } catch (error) { next(error); }
});
helperRouter.post("/conversations", validate(createSchema), async (req, res, next) => {
  try { const input = req.body as { game_id?: string; title?: string }; if (input.game_id && !(await prisma.game.findUnique({ where: { id: input.game_id } }))) throw new AppError(404, "RESOURCE_NOT_FOUND", "Game not found."); return data(res, await prisma.helperConversation.create({ data: { userId: req.auth!.userId, gameId: input.game_id, title: input.title } }), 201); } catch (error) { next(error); }
});
helperRouter.post("/conversations/:conversationId/messages", validate(messageSchema), async (req, res, next) => {
  try { const conversation = await prisma.helperConversation.findFirst({ where: { id: String(req.params.conversationId), userId: req.auth!.userId } }); if (!conversation) throw new AppError(404, "RESOURCE_NOT_FOUND", "Conversation not found."); const input = req.body as { content: string }; const message = await prisma.helperMessage.create({ data: { conversationId: conversation.id, role: "user", content: input.content } }); return data(res, message, 201); } catch (error) { next(error); }
});
