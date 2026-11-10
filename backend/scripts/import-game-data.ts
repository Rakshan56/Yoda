import "dotenv/config";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "../src/lib/prisma.js";

const gameIds = [
  "firered",
  "leafgreen",
  "ruby",
  "sapphire",
  "emerald",
] as const;
const gameId = z.enum(gameIds);
const sourceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  url: z.string().url(),
  organization: z.string().optional(),
  license_notes: z.string().optional(),
  credit_text: z.string().min(1),
});
const datasetSchema = z.object({
  game_id: gameId,
  source: sourceSchema,
  locations: z
    .array(
      z.object({
        external_id: z.string().min(1),
        name: z.string().min(1),
        slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
        region: z.string().min(1),
        description: z.string().optional(),
        map_asset_url: z.string().url().nullable().optional(),
      }),
    )
    .default([]),
  connections: z
    .array(
      z.object({
        from_external_id: z.string().min(1),
        to_external_id: z.string().min(1),
        connection_type: z.string().min(1),
        unlock_condition: z
          .record(z.string(), z.unknown())
          .nullable()
          .optional(),
      }),
    )
    .default([]),
  encounters: z
    .array(
      z.object({
        external_id: z.string().min(1),
        location_external_id: z.string().min(1),
        pokemon_id: z.string().min(1),
        method: z.string().min(1),
        min_level: z.number().int().min(1).max(100),
        max_level: z.number().int().min(1).max(100),
        encounter_rate: z.number().min(0).max(100).nullable().optional(),
        conditions: z.record(z.string(), z.unknown()).nullable().optional(),
      }),
    )
    .default([]),
});
const jsonValue = (
  value: Record<string, unknown> | null | undefined,
): Prisma.InputJsonValue | undefined =>
  value as Prisma.InputJsonValue | undefined;

const args = process.argv.slice(2);
const valueAfter = (flag: string) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
};
const input = valueAfter("--input");
const sourceType = z
  .enum(["API", "WIKI", "REPOSITORY", "MANUAL"])
  .parse(valueAfter("--source-type") ?? "REPOSITORY");
const dryRun = args.includes("--dry-run");
if (!input) {
  console.error(
    "Usage: npm run import:game -- --input data/emerald.json [--dry-run]",
  );
  process.exitCode = 1;
} else {
  try {
    const raw = await readFile(input, "utf8");
    const dataset = datasetSchema.parse(JSON.parse(raw));
    const checksum = createHash("sha256").update(raw).digest("hex");
    if (dryRun) {
      console.log(
        JSON.stringify({
          game_id: dataset.game_id,
          dry_run: true,
          checksum,
          locations: dataset.locations.length,
          connections: dataset.connections.length,
          encounters: dataset.encounters.length,
          status: "preview",
        }),
      );
    } else {
      const game = await prisma.game.findUnique({
        where: { id: dataset.game_id },
      });
      if (!game)
        throw new Error(
          `Unknown game: ${dataset.game_id}. Seed the canonical games first.`,
        );
      const source = await prisma.sourceRegistry.upsert({
        where: { id: dataset.source.id },
        update: {
          name: dataset.source.name,
          url: dataset.source.url,
          organization: dataset.source.organization,
          licenseNotes: dataset.source.license_notes,
          creditText: dataset.source.credit_text,
          retrievedAt: new Date(),
        },
        create: {
          id: dataset.source.id,
          name: dataset.source.name,
          sourceType,
          url: dataset.source.url,
          organization: dataset.source.organization,
          licenseNotes: dataset.source.license_notes,
          creditText: dataset.source.credit_text,
        },
      });
      const run = await prisma.dataImportRun.create({
        data: {
          sourceId: source.id,
          gameId: game.id,
          status: "RUNNING",
          dryRun,
          checksum,
        },
      });
      const locationIds = new Map<string, string>();
      for (const location of dataset.locations) {
        const saved = await prisma.location.upsert({
          where: { gameId_slug: { gameId: game.id, slug: location.slug } },
          update: {
            name: location.name,
            region: location.region,
            description: location.description,
            mapAssetUrl: location.map_asset_url ?? null,
            completeness: "NEEDS_REVIEW",
          },
          create: {
            gameId: game.id,
            name: location.name,
            slug: location.slug,
            region: location.region,
            description: location.description,
            mapAssetUrl: location.map_asset_url ?? null,
            completeness: "NEEDS_REVIEW",
          },
        });
        locationIds.set(location.external_id, saved.id);
        await prisma.sourceRecord.upsert({
          where: {
            sourceId_externalRecordId_contentType: {
              sourceId: source.id,
              externalRecordId: location.external_id,
              contentType: `location:${game.id}`,
            },
          },
          update: { checksum },
          create: {
            sourceId: source.id,
            externalRecordId: location.external_id,
            contentType: `location:${game.id}`,
            checksum,
          },
        });
        await prisma.contentSource.upsert({
          where: {
            sourceId_targetType_targetId_relationshipType_externalRecordId: {
              sourceId: source.id,
              targetType: "LOCATION",
              targetId: saved.id,
              relationshipType: "PRIMARY",
              externalRecordId: location.external_id,
            },
          },
          update: { gameId: game.id, locationId: saved.id },
          create: {
            sourceId: source.id,
            targetType: "LOCATION",
            targetId: saved.id,
            relationshipType: "PRIMARY",
            externalRecordId: location.external_id,
            gameId: game.id,
            locationId: saved.id,
          },
        });
      }
      for (const connection of dataset.connections) {
        const fromLocationId = locationIds.get(connection.from_external_id);
        const toLocationId = locationIds.get(connection.to_external_id);
        if (!fromLocationId || !toLocationId)
          throw new Error(
            `Connection references an unknown location: ${connection.from_external_id} -> ${connection.to_external_id}`,
          );
        await prisma.locationConnection.upsert({
          where: {
            gameId_fromLocationId_toLocationId_connectionType: {
              gameId: game.id,
              fromLocationId,
              toLocationId,
              connectionType: connection.connection_type,
            },
          },
          update: { unlockCondition: jsonValue(connection.unlock_condition) },
          create: {
            gameId: game.id,
            fromLocationId,
            toLocationId,
            connectionType: connection.connection_type,
            unlockCondition: jsonValue(connection.unlock_condition),
          },
        });
      }
      let failed = 0;
      for (const encounter of dataset.encounters) {
        const locationId = locationIds.get(encounter.location_external_id);
        if (!locationId || encounter.min_level > encounter.max_level) {
          failed += 1;
          await prisma.dataQualityIssue.create({
            data: {
              gameId: game.id,
              targetType: "ENCOUNTER",
              targetId: `${game.id}:${encounter.external_id}`,
              issueType: "INVALID_REFERENCE",
              description: !locationId
                ? "Encounter references an unknown location."
                : "Encounter minimum level exceeds maximum level.",
              severity: "HIGH",
            },
          });
          continue;
        }
        const dexNumber = Number(encounter.pokemon_id);
        const species = Number.isInteger(dexNumber)
          ? await prisma.pokemonSpecies.findUnique({
              where: { nationalDexNumber: dexNumber },
              include: { pokemon: true },
            })
          : null;
        const pokemon =
          species?.pokemon ??
          (await prisma.pokemon.findUnique({
            where: { id: encounter.pokemon_id },
          }));
        if (!pokemon) {
          failed += 1;
          await prisma.dataQualityIssue.upsert({
            where: {
              id: `${game.id}:${encounter.external_id}:MISSING_POKEMON`,
            },
            update: {
              description: `Encounter references unavailable Pokémon ${encounter.pokemon_id}.`,
            },
            create: {
              id: `${game.id}:${encounter.external_id}:MISSING_POKEMON`,
              gameId: game.id,
              targetType: "ENCOUNTER",
              targetId: `${game.id}:${encounter.external_id}`,
              issueType: "MISSING_POKEMON",
              description: `Encounter references unavailable Pokémon ${encounter.pokemon_id}.`,
              severity: "HIGH",
            },
          });
          continue;
        }
        await prisma.encounter.upsert({
          where: { id: `${game.id}:${encounter.external_id}` },
          update: {
            locationId,
            pokemonId: pokemon.id,
            method: encounter.method,
            minLevel: encounter.min_level,
            maxLevel: encounter.max_level,
            encounterRate: encounter.encounter_rate ?? null,
            conditionsJson: jsonValue(encounter.conditions),
            validationStatus: "NEEDS_REVIEW",
          },
          create: {
            id: `${game.id}:${encounter.external_id}`,
            gameId: game.id,
            locationId,
            pokemonId: pokemon.id,
            method: encounter.method,
            minLevel: encounter.min_level,
            maxLevel: encounter.max_level,
            encounterRate: encounter.encounter_rate ?? null,
            conditionsJson: jsonValue(encounter.conditions),
            validationStatus: "NEEDS_REVIEW",
          },
        });
        const encounterId = `${game.id}:${encounter.external_id}`;
        await prisma.contentSource.upsert({
          where: {
            sourceId_targetType_targetId_relationshipType_externalRecordId: {
              sourceId: source.id,
              targetType: "ENCOUNTER",
              targetId: encounterId,
              relationshipType: "PRIMARY",
              externalRecordId: encounter.external_id,
            },
          },
          update: { gameId: game.id, encounterId },
          create: {
            sourceId: source.id,
            targetType: "ENCOUNTER",
            targetId: encounterId,
            relationshipType: "PRIMARY",
            externalRecordId: encounter.external_id,
            gameId: game.id,
            encounterId,
          },
        });
        await prisma.dataQualityIssue.updateMany({
          where: {
            gameId: game.id,
            targetType: "ENCOUNTER",
            targetId: encounterId,
            issueType: "MISSING_POKEMON",
            status: { not: "RESOLVED" },
          },
          data: { status: "RESOLVED", resolvedAt: new Date() },
        });
      }
      await prisma.dataImportRun.update({
        where: { id: run.id },
        data: {
          status: failed ? "PARTIAL" : "NEEDS_REVIEW",
          finishedAt: new Date(),
          recordsImported:
            dataset.locations.length +
            dataset.connections.length +
            dataset.encounters.length -
            failed,
          recordsFailed: failed,
          errorSummary: failed
            ? `${failed} encounter records were rejected.`
            : null,
        },
      });
      console.log(
        JSON.stringify({
          run_id: run.id,
          game_id: game.id,
          dry_run: false,
          imported:
            dataset.locations.length +
            dataset.connections.length +
            dataset.encounters.length -
            failed,
          failed,
          status: failed ? "partial" : "needs_review",
        }),
      );
    }
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : "Game-data import failed.",
    );
    process.exitCode = 1;
  }
}
await prisma.$disconnect();
