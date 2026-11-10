CREATE TABLE "HelperConversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameId" TEXT,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HelperConversation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HelperMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HelperMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "HelperConversation_userId_updatedAt_idx" ON "HelperConversation"("userId", "updatedAt");
CREATE INDEX "HelperMessage_conversationId_createdAt_idx" ON "HelperMessage"("conversationId", "createdAt");
ALTER TABLE "HelperConversation" ADD CONSTRAINT "HelperConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HelperConversation" ADD CONSTRAINT "HelperConversation_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "HelperMessage" ADD CONSTRAINT "HelperMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "HelperConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
