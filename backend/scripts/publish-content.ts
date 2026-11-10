import "dotenv/config";
import { prisma } from "../src/lib/prisma.js";
import { z } from "zod";

const targetTypes = [
  "LOCATION",
  "ENCOUNTER",
  "WALKTHROUGH_CHAPTER",
  "BATTLE",
  "QUEST",
] as const;
const targetType = z
  .enum(targetTypes)
  .parse(process.argv[process.argv.indexOf("--target-type") + 1]);
const targetId = process.argv[process.argv.indexOf("--target-id") + 1];
const reviewer =
  process.argv[process.argv.indexOf("--reviewer") + 1] ?? "manual-review";
if (!targetId) {
  console.error(
    "Usage: npm run publish:content -- --target-type LOCATION --target-id <id> --reviewer <name>",
  );
  process.exitCode = 1;
} else {
  try {
    const source = await prisma.contentSource.findFirst({
      where: { targetType, targetId },
    });
    if (!source)
      throw new Error(
        "Cannot publish content without a recorded source reference.",
      );
    const issues = await prisma.dataQualityIssue.findMany({
      where: { targetType, targetId, status: { not: "RESOLVED" } },
    });
    if (issues.length)
      throw new Error(
        `Cannot publish content with ${issues.length} unresolved quality issue(s).`,
      );
    const status =
      targetType === "LOCATION"
        ? await prisma.location.findUnique({
            where: { id: targetId },
            select: { completeness: true },
          })
        : targetType === "ENCOUNTER"
          ? await prisma.encounter.findUnique({
              where: { id: targetId },
              select: { validationStatus: true },
            })
          : targetType === "WALKTHROUGH_CHAPTER"
            ? await prisma.walkthroughChapter.findUnique({
                where: { id: targetId },
                select: { status: true },
              })
            : targetType === "BATTLE"
              ? await prisma.battle.findUnique({
                  where: { id: targetId },
                  select: { status: true },
                })
              : await prisma.quest.findUnique({
                  where: { id: targetId },
                  select: { status: true },
                });
    if (!status) throw new Error("Target content was not found.");
    const currentStatus =
      "completeness" in status
        ? status.completeness
        : "status" in status
          ? status.status
          : status.validationStatus;
    if (currentStatus !== "NEEDS_REVIEW" && currentStatus !== "VERIFIED")
      throw new Error(
        `Content must be NEEDS_REVIEW or VERIFIED before publication; current status is ${currentStatus}.`,
      );
    await prisma.$transaction(async (transaction) => {
      if (targetType === "LOCATION")
        await transaction.location.update({
          where: { id: targetId },
          data: { completeness: "PUBLISHED" },
        });
      if (targetType === "ENCOUNTER")
        await transaction.encounter.update({
          where: { id: targetId },
          data: { validationStatus: "PUBLISHED" },
        });
      if (targetType === "WALKTHROUGH_CHAPTER")
        await transaction.walkthroughChapter.update({
          where: { id: targetId },
          data: { status: "PUBLISHED" },
        });
      if (targetType === "BATTLE")
        await transaction.battle.update({
          where: { id: targetId },
          data: { status: "PUBLISHED" },
        });
      if (targetType === "QUEST")
        await transaction.quest.update({
          where: { id: targetId },
          data: { status: "PUBLISHED" },
        });
      await transaction.publishedContent.upsert({
        where: { targetType_targetId: { targetType, targetId } },
        update: {
          status: "PUBLISHED",
          publishedBy: reviewer,
          publishedAt: new Date(),
          version: { increment: 1 },
        },
        create: {
          targetType,
          targetId,
          status: "PUBLISHED",
          publishedBy: reviewer,
          publishedAt: new Date(),
        },
      });
    });
    console.log(
      JSON.stringify({
        target_type: targetType,
        target_id: targetId,
        status: "PUBLISHED",
        published_by: reviewer,
      }),
    );
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : "Publication failed.",
    );
    process.exitCode = 1;
  }
}
await prisma.$disconnect();
