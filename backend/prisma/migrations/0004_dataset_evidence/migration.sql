CREATE TABLE "DataImportRun" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "gameId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "recordsImported" INTEGER NOT NULL DEFAULT 0,
    "recordsFailed" INTEGER NOT NULL DEFAULT 0,
    "errorSummary" TEXT,
    "dryRun" BOOLEAN NOT NULL DEFAULT false,
    "checksum" TEXT,
    CONSTRAINT "DataImportRun_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ContentSource" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "relationshipType" TEXT NOT NULL,
    "externalRecordId" TEXT,
    "excerpt" TEXT,
    "gameId" TEXT,
    "locationId" TEXT,
    "encounterId" TEXT,
    "chapterId" TEXT,
    "battleId" TEXT,
    "questId" TEXT,
    CONSTRAINT "ContentSource_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DataQualityIssue" (
    "id" TEXT NOT NULL,
    "gameId" TEXT,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "issueType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "reportedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    CONSTRAINT "DataQualityIssue_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PublishedContent" (
    "id" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL,
    "publishedBy" TEXT,
    "publishedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "PublishedContent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DataImportRun_sourceId_startedAt_idx" ON "DataImportRun"("sourceId", "startedAt");
CREATE INDEX "DataImportRun_gameId_startedAt_idx" ON "DataImportRun"("gameId", "startedAt");
CREATE INDEX "ContentSource_targetType_targetId_idx" ON "ContentSource"("targetType", "targetId");
CREATE UNIQUE INDEX "ContentSource_sourceId_targetType_targetId_relationshipType_externalRecordId_key"
ON "ContentSource"("sourceId", "targetType", "targetId", "relationshipType", "externalRecordId");
CREATE INDEX "DataQualityIssue_gameId_status_idx" ON "DataQualityIssue"("gameId", "status");
CREATE INDEX "DataQualityIssue_targetType_targetId_idx" ON "DataQualityIssue"("targetType", "targetId");
CREATE UNIQUE INDEX "PublishedContent_targetType_targetId_key" ON "PublishedContent"("targetType", "targetId");

ALTER TABLE "DataImportRun" ADD CONSTRAINT "DataImportRun_sourceId_fkey"
FOREIGN KEY ("sourceId") REFERENCES "SourceRegistry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DataImportRun" ADD CONSTRAINT "DataImportRun_gameId_fkey"
FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ContentSource" ADD CONSTRAINT "ContentSource_sourceId_fkey"
FOREIGN KEY ("sourceId") REFERENCES "SourceRegistry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContentSource" ADD CONSTRAINT "ContentSource_gameId_fkey"
FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ContentSource" ADD CONSTRAINT "ContentSource_locationId_fkey"
FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ContentSource" ADD CONSTRAINT "ContentSource_encounterId_fkey"
FOREIGN KEY ("encounterId") REFERENCES "Encounter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ContentSource" ADD CONSTRAINT "ContentSource_chapterId_fkey"
FOREIGN KEY ("chapterId") REFERENCES "WalkthroughChapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ContentSource" ADD CONSTRAINT "ContentSource_battleId_fkey"
FOREIGN KEY ("battleId") REFERENCES "Battle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ContentSource" ADD CONSTRAINT "ContentSource_questId_fkey"
FOREIGN KEY ("questId") REFERENCES "Quest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DataQualityIssue" ADD CONSTRAINT "DataQualityIssue_gameId_fkey"
FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;
