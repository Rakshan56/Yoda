export const GENERATION_III_TYPES = ["normal","fire","water","electric","grass","ice","fighting","poison","ground","flying","psychic","bug","rock","ghost","dragon","dark","steel"] as const;
const chart: Record<string, Record<string, number>> = {
  normal: { rock: .5, ghost: 0, steel: .5 }, fire: { fire: .5, water: .5, grass: 2, ice: 2, bug: 2, rock: .5, dragon: .5, steel: 2 },
  water: { fire: 2, water: .5, grass: .5, ground: 2, rock: 2, dragon: .5 }, electric: { water: 2, electric: .5, grass: .5, ground: 0, flying: 2, dragon: .5 },
  grass: { fire: .5, water: 2, grass: .5, poison: .5, ground: 2, flying: .5, bug: .5, rock: 2, dragon: .5, steel: .5 },
  ice: { water: .5, grass: 2, ice: .5, ground: 2, flying: 2, dragon: 2, steel: .5 }, fighting: { normal: 2, ice: 2, poison: .5, flying: .5, psychic: .5, bug: .5, rock: 2, ghost: 0, dark: 2, steel: 2 },
  poison: { grass: 2, poison: .5, ground: .5, rock: .5, ghost: .5, steel: 0 }, ground: { fire: 2, electric: 2, grass: .5, poison: 2, flying: 0, bug: .5, rock: 2, steel: 2 },
  flying: { electric: .5, grass: 2, fighting: 2, bug: 2, rock: .5, steel: .5 }, psychic: { fighting: 2, poison: 2, psychic: .5, dark: 0, steel: .5 },
  bug: { fire: .5, grass: 2, fighting: .5, poison: .5, flying: .5, psychic: 2, ghost: .5, dark: 2, steel: .5 }, rock: { fire: 2, ice: 2, fighting: .5, ground: .5, flying: 2, bug: 2, steel: .5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: .5 }, dragon: { dragon: 2, steel: .5 }, dark: { fighting: .5, psychic: 2, ghost: 2, dark: .5, steel: .5 },
  steel: { fire: .5, water: .5, electric: .5, ice: 2, rock: 2, steel: .5, fairy: 1 }
};
export const calculateTypeEffectiveness = (moveType: string, defenderTypes: string[], gameId: string) => {
  if (!GENERATION_III_TYPES.includes(moveType as typeof GENERATION_III_TYPES[number]) || defenderTypes.some((type) => !GENERATION_III_TYPES.includes(type as typeof GENERATION_III_TYPES[number]))) {
    throw new Error(`Unsupported Generation III type for ${gameId}`);
  }
  return defenderTypes.reduce((result, type) => result * (chart[moveType]?.[type] ?? 1), 1);
};
export const analyzeTeamTypes = (members: Array<{ types: string[] }>, gameId: string) => {
  const weaknesses: Record<string, number> = {};
  const resistances: Record<string, number> = {};
  for (const moveType of GENERATION_III_TYPES) for (const member of members) {
    const multiplier = calculateTypeEffectiveness(moveType, member.types, gameId);
    if (multiplier > 1) weaknesses[moveType] = (weaknesses[moveType] ?? 0) + 1;
    if (multiplier < 1) resistances[moveType] = (resistances[moveType] ?? 0) + 1;
  }
  return { weaknesses, resistances, member_count: members.length, ruleset: "generation_iii" };
};
