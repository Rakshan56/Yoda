import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { data } from "../../lib/response.js";
import { AppError } from "../../lib/errors.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";

export const adminRouter = Router();
adminRouter.use(authenticate, authorize("ADMIN"));

const issueParams = z.object({ params: z.object({ issueId: z.string().uuid() }) });
const issueBody = z.object({ body: z.object({ status: z.enum(["OPEN", "IN_REVIEW", "RESOLVED"]), description: z.string().min(1).max(2000).optional() }) });
const publishBody = z.object({ body: z.object({ target_type: z.enum(["LOCATION", "ENCOUNTER", "WALKTHROUGH_CHAPTER", "BATTLE", "QUEST"]), target_id: z.string().min(1) }) });
const reportParams = z.object({ params: z.object({ reportId: z.string().uuid() }) });
const reportBody = z.object({ body: z.object({ status: z.enum(["OPEN", "IN_REVIEW", "RESOLVED"]), reason: z.string().trim().min(1).max(100).optional(), description: z.string().trim().max(2000).nullable().optional() }) });
const sourceBody = z.object({ body: z.object({ id: z.string().min(1).max(100), name: z.string().min(1).max(150), source_type: z.enum(["API", "WIKI", "REPOSITORY", "MANUAL"]), url: z.string().url(), organization: z.string().max(150).nullable().optional(), license_notes: z.string().max(2000).nullable().optional(), credit_text: z.string().min(1).max(1000) }) });

adminRouter.get("/quality-issues", async (req, res, next) => {
  try { return data(res, await prisma.dataQualityIssue.findMany({ where: { status: typeof req.query.status === "string" ? req.query.status : undefined }, orderBy: [{ severity: "desc" }, { status: "asc" }, { targetType: "asc" }] })); } catch (error) { next(error); }
});

adminRouter.get("/reports", async (req, res, next) => {
  try { return data(res, await prisma.contentReport.findMany({ where: { status: typeof req.query.status === "string" ? req.query.status : undefined }, orderBy: { createdAt: "desc" } })); } catch (error) { next(error); }
});

adminRouter.patch("/reports/:reportId", validate(z.object({ params: reportParams.shape.params, body: reportBody.shape.body })), async (req, res, next) => {
  try {
    const input = req.body as { status: "OPEN" | "IN_REVIEW" | "RESOLVED"; reason?: string; description?: string | null };
    const report = await prisma.contentReport.findUnique({ where: { id: String(req.params.reportId) } });
    if (!report) throw new AppError(404, "RESOURCE_NOT_FOUND", "Content report not found.");
    const updated = await prisma.$transaction(async (transaction) => {
      const result = await transaction.contentReport.update({ where: { id: report.id }, data: { status: input.status, reason: input.reason ?? report.reason, description: input.description === undefined ? report.description : input.description, resolvedBy: input.status === "RESOLVED" ? req.auth!.userId : null, resolvedAt: input.status === "RESOLVED" ? new Date() : null } });
      await transaction.adminAuditLog.create({ data: { adminUserId: req.auth!.userId, action: "CONTENT_REPORT_UPDATED", targetType: "CONTENT_REPORT", targetId: report.id, beforeJson: report, afterJson: result } });
      return result;
    });
    return data(res, updated);
  } catch (error) { next(error); }
});

adminRouter.get("/sources", async (_req, res, next) => {
  try { return data(res, await prisma.sourceRegistry.findMany({ orderBy: { name: "asc" } })); } catch (error) { next(error); }
});

adminRouter.post("/sources", validate(sourceBody), async (req, res, next) => {
  try {
    const input = req.body as { id: string; name: string; source_type: "API" | "WIKI" | "REPOSITORY" | "MANUAL"; url: string; organization?: string | null; license_notes?: string | null; credit_text: string };
    const source = await prisma.sourceRegistry.create({ data: { id: input.id, name: input.name, sourceType: input.source_type, url: input.url, organization: input.organization, licenseNotes: input.license_notes, creditText: input.credit_text } });
    await prisma.adminAuditLog.create({ data: { adminUserId: req.auth!.userId, action: "SOURCE_CREATED", targetType: "SOURCE_REGISTRY", targetId: source.id, afterJson: source } });
    return data(res, source, 201);
  } catch (error) { next(error); }
});

adminRouter.patch("/sources/:sourceId", validate(z.object({ params: z.object({ sourceId: z.string().min(1) }), body: sourceBody.shape.body.omit({ id: true }) })), async (req, res, next) => {
  try {
    const source = await prisma.sourceRegistry.findUnique({ where: { id: String(req.params.sourceId) } });
    if (!source) throw new AppError(404, "RESOURCE_NOT_FOUND", "Source not found.");
    const input = req.body as { name: string; source_type: "API" | "WIKI" | "REPOSITORY" | "MANUAL"; url: string; organization?: string | null; license_notes?: string | null; credit_text: string };
    const updated = await prisma.sourceRegistry.update({ where: { id: source.id }, data: { name: input.name, sourceType: input.source_type, url: input.url, organization: input.organization, licenseNotes: input.license_notes, creditText: input.credit_text } });
    await prisma.adminAuditLog.create({ data: { adminUserId: req.auth!.userId, action: "SOURCE_UPDATED", targetType: "SOURCE_REGISTRY", targetId: source.id, beforeJson: source, afterJson: updated } });
    return data(res, updated);
  } catch (error) { next(error); }
});

adminRouter.patch("/quality-issues/:issueId", validate(z.object({ params: issueParams.shape.params, body: issueBody.shape.body })), async (req, res, next) => {
  try {
    const input = req.body as { status: "OPEN" | "IN_REVIEW" | "RESOLVED"; description?: string };
    const issue = await prisma.dataQualityIssue.findUnique({ where: { id: String(req.params.issueId) } });
    if (!issue) throw new AppError(404, "RESOURCE_NOT_FOUND", "Quality issue not found.");
    const updated = await prisma.$transaction(async (transaction) => {
      const result = await transaction.dataQualityIssue.update({ where: { id: issue.id }, data: { status: input.status, description: input.description ?? issue.description, reportedBy: req.auth!.userId, resolvedAt: input.status === "RESOLVED" ? new Date() : null } });
      await transaction.adminAuditLog.create({ data: { adminUserId: req.auth!.userId, action: "QUALITY_ISSUE_UPDATED", targetType: "DATA_QUALITY_ISSUE", targetId: issue.id, beforeJson: issue, afterJson: result } });
      return result;
    });
    return data(res, updated);
  } catch (error) { next(error); }
});

adminRouter.post("/publish", validate(publishBody), async (req, res, next) => {
  try {
    const input = req.body as { target_type: "LOCATION" | "ENCOUNTER" | "WALKTHROUGH_CHAPTER" | "BATTLE" | "QUEST"; target_id: string };
    const source = await prisma.contentSource.findFirst({ where: { targetType: input.target_type, targetId: input.target_id } });
    if (!source) throw new AppError(409, "CONTENT_NOT_READY", "Content requires a source reference before publication.");
    const unresolved = await prisma.dataQualityIssue.count({ where: { targetType: input.target_type, targetId: input.target_id, status: { not: "RESOLVED" } } });
    if (unresolved) throw new AppError(409, "CONTENT_NOT_READY", `Content has ${unresolved} unresolved quality issue(s).`);
    const target = input.target_type === "LOCATION"
      ? await prisma.location.findUnique({ where: { id: input.target_id }, select: { completeness: true } })
      : input.target_type === "ENCOUNTER"
        ? await prisma.encounter.findUnique({ where: { id: input.target_id }, select: { validationStatus: true } })
        : input.target_type === "WALKTHROUGH_CHAPTER"
          ? await prisma.walkthroughChapter.findUnique({ where: { id: input.target_id }, select: { status: true } })
          : input.target_type === "BATTLE"
            ? await prisma.battle.findUnique({ where: { id: input.target_id }, select: { status: true } })
            : await prisma.quest.findUnique({ where: { id: input.target_id }, select: { status: true } });
    const currentStatus = target && "completeness" in target ? target.completeness : target && "validationStatus" in target ? target.validationStatus : target?.status;
    if (!currentStatus) throw new AppError(404, "RESOURCE_NOT_FOUND", "Content target not found.");
    if (currentStatus !== "NEEDS_REVIEW" && currentStatus !== "VERIFIED") throw new AppError(409, "CONTENT_NOT_READY", `Content must be NEEDS_REVIEW or VERIFIED before publication; current status is ${currentStatus}.`);
    const result = await prisma.$transaction(async (transaction) => {
      if (input.target_type === "LOCATION") await transaction.location.update({ where: { id: input.target_id }, data: { completeness: "PUBLISHED" } });
      if (input.target_type === "ENCOUNTER") await transaction.encounter.update({ where: { id: input.target_id }, data: { validationStatus: "PUBLISHED" } });
      if (input.target_type === "WALKTHROUGH_CHAPTER") await transaction.walkthroughChapter.update({ where: { id: input.target_id }, data: { status: "PUBLISHED" } });
      if (input.target_type === "BATTLE") await transaction.battle.update({ where: { id: input.target_id }, data: { status: "PUBLISHED" } });
      if (input.target_type === "QUEST") await transaction.quest.update({ where: { id: input.target_id }, data: { status: "PUBLISHED" } });
      const published = await transaction.publishedContent.upsert({ where: { targetType_targetId: { targetType: input.target_type, targetId: input.target_id } }, update: { status: "PUBLISHED", publishedBy: req.auth!.userId, publishedAt: new Date(), version: { increment: 1 } }, create: { targetType: input.target_type, targetId: input.target_id, status: "PUBLISHED", publishedBy: req.auth!.userId, publishedAt: new Date() } });
      await transaction.adminAuditLog.create({ data: { adminUserId: req.auth!.userId, action: "CONTENT_PUBLISHED", targetType: input.target_type, targetId: input.target_id, afterJson: published } });
      return published;
    });

    adminRouter.post("/unpublish", validate(publishBody), async (req, res, next) => {
      try {
        const input = req.body as { target_type: "LOCATION" | "ENCOUNTER" | "WALKTHROUGH_CHAPTER" | "BATTLE" | "QUEST"; target_id: string };
        const current = input.target_type === "LOCATION"
          ? await prisma.location.findUnique({ where: { id: input.target_id }, select: { completeness: true } })
          : input.target_type === "ENCOUNTER"
            ? await prisma.encounter.findUnique({ where: { id: input.target_id }, select: { validationStatus: true } })
            : input.target_type === "WALKTHROUGH_CHAPTER"
              ? await prisma.walkthroughChapter.findUnique({ where: { id: input.target_id }, select: { status: true } })
              : input.target_type === "BATTLE"
                ? await prisma.battle.findUnique({ where: { id: input.target_id }, select: { status: true } })
                : await prisma.quest.findUnique({ where: { id: input.target_id }, select: { status: true } });
        if (!current) throw new AppError(404, "RESOURCE_NOT_FOUND", "Content target not found.");
        const before = current;
        const result = await prisma.$transaction(async (transaction) => {
          if (input.target_type === "LOCATION") await transaction.location.update({ where: { id: input.target_id }, data: { completeness: "DRAFT" } });
          if (input.target_type === "ENCOUNTER") await transaction.encounter.update({ where: { id: input.target_id }, data: { validationStatus: "DRAFT" } });
          if (input.target_type === "WALKTHROUGH_CHAPTER") await transaction.walkthroughChapter.update({ where: { id: input.target_id }, data: { status: "DRAFT" } });
          if (input.target_type === "BATTLE") await transaction.battle.update({ where: { id: input.target_id }, data: { status: "DRAFT" } });
          if (input.target_type === "QUEST") await transaction.quest.update({ where: { id: input.target_id }, data: { status: "DRAFT" } });
          const unpublished = await transaction.publishedContent.update({ where: { targetType_targetId: { targetType: input.target_type, targetId: input.target_id } }, data: { status: "DRAFT", publishedBy: req.auth!.userId, publishedAt: null } });
          await transaction.adminAuditLog.create({ data: { adminUserId: req.auth!.userId, action: "CONTENT_UNPUBLISHED", targetType: input.target_type, targetId: input.target_id, beforeJson: before, afterJson: unpublished } });
          return unpublished;
        });
        return data(res, result);
      } catch (error) { next(error); }
    });
    return data(res, result);
  } catch (error) { next(error); }
});
