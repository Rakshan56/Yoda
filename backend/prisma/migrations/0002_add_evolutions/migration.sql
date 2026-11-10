CREATE TABLE "Evolution" (
    "id" TEXT NOT NULL,
    "fromSpeciesId" TEXT NOT NULL,
    "toSpeciesId" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "minLevel" INTEGER,
    "itemId" TEXT,
    "conditionJson" JSONB,
    CONSTRAINT "Evolution_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Evolution_fromSpeciesId_toSpeciesId_trigger_key"
ON "Evolution"("fromSpeciesId", "toSpeciesId", "trigger");

CREATE INDEX "Evolution_toSpeciesId_idx" ON "Evolution"("toSpeciesId");

ALTER TABLE "Evolution"
ADD CONSTRAINT "Evolution_fromSpeciesId_fkey"
FOREIGN KEY ("fromSpeciesId") REFERENCES "PokemonSpecies"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Evolution"
ADD CONSTRAINT "Evolution_toSpeciesId_fkey"
FOREIGN KEY ("toSpeciesId") REFERENCES "PokemonSpecies"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Evolution"
ADD CONSTRAINT "Evolution_itemId_fkey"
FOREIGN KEY ("itemId") REFERENCES "Item"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
