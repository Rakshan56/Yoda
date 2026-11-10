-- CreateEnum
CREATE TYPE "FlagType" AS ENUM ('STORY', 'BADGE', 'ITEM', 'OPTIONAL');

-- AlterTable
ALTER TABLE "WalkthroughChapter" ADD COLUMN     "endLocationId" TEXT,
ADD COLUMN     "isPostgame" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "spoilerLevel" TEXT NOT NULL DEFAULT 'standard',
ADD COLUMN     "startLocationId" TEXT;

-- AlterTable
ALTER TABLE "WalkthroughStep" ADD COLUMN     "locationId" TEXT;

-- AlterTable
ALTER TABLE "Battle" ADD COLUMN     "locationId" TEXT;

-- AlterTable
ALTER TABLE "Quest" ADD COLUMN     "isMissable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "startLocationId" TEXT;

-- CreateTable
CREATE TABLE "LocationConnection" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "fromLocationId" TEXT NOT NULL,
    "toLocationId" TEXT NOT NULL,
    "connectionType" TEXT NOT NULL,
    "unlockCondition" JSONB,

    CONSTRAINT "LocationConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocationItem" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "acquisitionMethod" TEXT NOT NULL,
    "requiresHiddenSearch" BOOLEAN NOT NULL DEFAULT false,
    "isOneTime" BOOLEAN NOT NULL DEFAULT true,
    "conditionJson" JSONB,
    "validationStatus" "ContentStatus" NOT NULL DEFAULT 'NEEDS_REVIEW',

    CONSTRAINT "LocationItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shop" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Shop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopInventory" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "availabilityCondition" JSONB,

    CONSTRAINT "ShopInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StepPrerequisite" (
    "id" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "prerequisiteStepId" TEXT,
    "prerequisiteFlag" TEXT,
    "conditionJson" JSONB,

    CONSTRAINT "StepPrerequisite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trainer" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "locationId" TEXT,
    "name" TEXT NOT NULL,
    "trainerClass" TEXT NOT NULL,
    "battleOrder" INTEGER NOT NULL,
    "rewardMoney" INTEGER,
    "isRematch" BOOLEAN NOT NULL DEFAULT false,
    "validationStatus" "ContentStatus" NOT NULL DEFAULT 'NEEDS_REVIEW',

    CONSTRAINT "Trainer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainerPokemon" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "pokemonId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "heldItemId" TEXT,
    "movesJson" JSONB,
    "abilityId" TEXT,
    "position" INTEGER NOT NULL,

    CONSTRAINT "TrainerPokemon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BattleTrainer" (
    "battleId" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,

    CONSTRAINT "BattleTrainer_pkey" PRIMARY KEY ("battleId","trainerId")
);

-- CreateTable
CREATE TABLE "BattleStrategy" (
    "id" TEXT NOT NULL,
    "battleId" TEXT NOT NULL,
    "recommendedLevel" INTEGER,
    "preparation" TEXT,
    "strategyText" TEXT NOT NULL,
    "validationStatus" "ContentStatus" NOT NULL DEFAULT 'NEEDS_REVIEW',

    CONSTRAINT "BattleStrategy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestStep" (
    "id" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "prerequisiteJson" JSONB,
    "completionConditionJson" JSONB,

    CONSTRAINT "QuestStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameFlag" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "flagKey" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "flagType" "FlagType" NOT NULL,

    CONSTRAINT "GameFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecklistTemplate" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "ChecklistTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecklistItem" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "locationId" TEXT,
    "itemId" TEXT,
    "pokemonId" TEXT,
    "isMissable" BOOLEAN NOT NULL DEFAULT false,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "ChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LocationConnection_gameId_fromLocationId_toLocationId_conne_key" ON "LocationConnection"("gameId", "fromLocationId", "toLocationId", "connectionType");

-- CreateIndex
CREATE INDEX "LocationItem_gameId_locationId_idx" ON "LocationItem"("gameId", "locationId");

-- CreateIndex
CREATE UNIQUE INDEX "Shop_gameId_locationId_name_key" ON "Shop"("gameId", "locationId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "ShopInventory_shopId_itemId_key" ON "ShopInventory"("shopId", "itemId");

-- CreateIndex
CREATE INDEX "StepPrerequisite_prerequisiteStepId_idx" ON "StepPrerequisite"("prerequisiteStepId");

-- CreateIndex
CREATE INDEX "Trainer_gameId_locationId_idx" ON "Trainer"("gameId", "locationId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainerPokemon_trainerId_position_key" ON "TrainerPokemon"("trainerId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "BattleTrainer_battleId_orderIndex_key" ON "BattleTrainer"("battleId", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "QuestStep_questId_stepNumber_key" ON "QuestStep"("questId", "stepNumber");

-- CreateIndex
CREATE UNIQUE INDEX "GameFlag_gameId_flagKey_key" ON "GameFlag"("gameId", "flagKey");

-- CreateIndex
CREATE UNIQUE INDEX "ChecklistTemplate_gameId_category_title_key" ON "ChecklistTemplate"("gameId", "category", "title");

-- CreateIndex
CREATE UNIQUE INDEX "ChecklistItem_templateId_sortOrder_key" ON "ChecklistItem"("templateId", "sortOrder");

-- CreateIndex
CREATE INDEX "Encounter_gameId_locationId_method_idx" ON "Encounter"("gameId", "locationId", "method");

-- CreateIndex
CREATE UNIQUE INDEX "Battle_gameId_sequenceNumber_name_key" ON "Battle"("gameId", "sequenceNumber", "name");

-- AddForeignKey
ALTER TABLE "LocationConnection" ADD CONSTRAINT "LocationConnection_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationConnection" ADD CONSTRAINT "LocationConnection_fromLocationId_fkey" FOREIGN KEY ("fromLocationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationConnection" ADD CONSTRAINT "LocationConnection_toLocationId_fkey" FOREIGN KEY ("toLocationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationItem" ADD CONSTRAINT "LocationItem_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationItem" ADD CONSTRAINT "LocationItem_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationItem" ADD CONSTRAINT "LocationItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shop" ADD CONSTRAINT "Shop_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shop" ADD CONSTRAINT "Shop_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopInventory" ADD CONSTRAINT "ShopInventory_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopInventory" ADD CONSTRAINT "ShopInventory_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalkthroughChapter" ADD CONSTRAINT "WalkthroughChapter_startLocationId_fkey" FOREIGN KEY ("startLocationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalkthroughChapter" ADD CONSTRAINT "WalkthroughChapter_endLocationId_fkey" FOREIGN KEY ("endLocationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalkthroughStep" ADD CONSTRAINT "WalkthroughStep_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StepPrerequisite" ADD CONSTRAINT "StepPrerequisite_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "WalkthroughStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StepPrerequisite" ADD CONSTRAINT "StepPrerequisite_prerequisiteStepId_fkey" FOREIGN KEY ("prerequisiteStepId") REFERENCES "WalkthroughStep"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Battle" ADD CONSTRAINT "Battle_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trainer" ADD CONSTRAINT "Trainer_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trainer" ADD CONSTRAINT "Trainer_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerPokemon" ADD CONSTRAINT "TrainerPokemon_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerPokemon" ADD CONSTRAINT "TrainerPokemon_pokemonId_fkey" FOREIGN KEY ("pokemonId") REFERENCES "Pokemon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerPokemon" ADD CONSTRAINT "TrainerPokemon_heldItemId_fkey" FOREIGN KEY ("heldItemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerPokemon" ADD CONSTRAINT "TrainerPokemon_abilityId_fkey" FOREIGN KEY ("abilityId") REFERENCES "Ability"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleTrainer" ADD CONSTRAINT "BattleTrainer_battleId_fkey" FOREIGN KEY ("battleId") REFERENCES "Battle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleTrainer" ADD CONSTRAINT "BattleTrainer_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleStrategy" ADD CONSTRAINT "BattleStrategy_battleId_fkey" FOREIGN KEY ("battleId") REFERENCES "Battle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quest" ADD CONSTRAINT "Quest_startLocationId_fkey" FOREIGN KEY ("startLocationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestStep" ADD CONSTRAINT "QuestStep_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameFlag" ADD CONSTRAINT "GameFlag_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistTemplate" ADD CONSTRAINT "ChecklistTemplate_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ChecklistTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_pokemonId_fkey" FOREIGN KEY ("pokemonId") REFERENCES "Pokemon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

