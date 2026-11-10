import "dotenv/config";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const games = [
  ["firered", "Pokémon FireRed", "Kanto", 2004, "firered-leafgreen"],
  ["leafgreen", "Pokémon LeafGreen", "Kanto", 2004, "firered-leafgreen"],
  ["ruby", "Pokémon Ruby", "Hoenn", 2002, "ruby-sapphire"],
  ["sapphire", "Pokémon Sapphire", "Hoenn", 2002, "ruby-sapphire"],
  ["emerald", "Pokémon Emerald", "Hoenn", 2004, "emerald"]
] as const;
async function main() {
  const regions = new Map<string, string>();
  for (const [name, slug] of [["Kanto", "kanto"], ["Hoenn", "hoenn"]] as const) {
    const region = await prisma.region.upsert({ where: { slug }, update: { name }, create: { name, slug } });
    regions.set(name, region.id);
  }
  for (const [id, name, region, releaseYear, versionGroup] of games) {
    await prisma.game.upsert({ where: { id }, update: { name, regionId: regions.get(region)! }, create: { id, name, generation: 3, platform: "Game Boy Advance", regionId: regions.get(region)!, releaseYear, versionGroup, description: `${name} guide data.`, isActive: true } });
  }
  for (const name of ["normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel"]) {
    await prisma.type.upsert({ where: { id: name }, update: { name }, create: { id: name, name } });
  }
}
main().finally(() => prisma.$disconnect());
