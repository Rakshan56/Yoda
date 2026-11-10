export const GAME_IDS = ["firered", "leafgreen", "ruby", "sapphire", "emerald"] as const;
export type GameId = (typeof GAME_IDS)[number];

export type ApiError = {
  code: string;
  message: string;
  details?: unknown[];
  request_id?: string;
};

export type ApiEnvelope<T> = { data: T };
export type Paginated<T> = {
  data: T[];
  meta: { page: number; page_size: number; total: number; total_pages: number };
};

export type Game = {
  id: GameId;
  name: string;
  generation: number;
  platform: string;
  region: { id: string; name: string };
  release_year: number;
  version_group: string;
  box_art_url: string | null;
  description: string | null;
  is_active: boolean;
};

export type User = {
  id: string;
  email: string;
  display_name: string;
  role: "USER" | "ADMIN";
};

export type GameProgress = {
  game_id: GameId;
  game_name: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETE";
  updated_at: string;
};

export type Location = {
  id: string;
  name: string;
  slug: string;
  region: string;
  description: string | null;
  map_asset_url: string | null;
  completeness: string;
};

export type Encounter = {
  id: string;
  pokemon_id: string;
  pokemon_name: string;
  method: string;
  min_level: number;
  max_level: number;
  encounter_rate: number | null;
  conditions: unknown;
};

export type LocationItem = {
  id: string;
  item: { id: string; name: string };
  quantity: number;
  acquisition_method: string | null;
  requires_hidden_search: boolean;
  is_one_time: boolean;
  condition: unknown;
};

export type Trainer = {
  id: string;
  name: string;
  class_name: string | null;
  battle_order: number;
  notes: string | null;
  pokemon: Array<{ pokemon: { id: string; name: string }; level: number; position: number }>;
};

export type LocationConnection = {
  id: string;
  connection_type: string;
  unlock_condition: unknown;
  from: Location;
  to: Location;
};

export type WalkthroughStep = {
  id: string;
  step_number: number;
  title: string;
  description: string | null;
  objective: string | null;
  prerequisites: unknown;
  recommended_level: number | null;
  is_optional: boolean;
};

export type WalkthroughChapter = {
  id: string;
  chapter_number: number;
  title: string;
  summary: string | null;
  status?: string;
  steps?: WalkthroughStep[];
};

export type Battle = {
  id: string;
  name: string;
  battle_type: string | null;
  sequence_number: number;
  location_id: string | null;
  notes: string | null;
  trainers?: Array<{ order_index: number; trainer: Trainer }>;
  strategies?: Array<Record<string, unknown>>;
};

export type Pokemon = {
  id: string;
  name: string;
  species: {
    id: string;
    name: string;
    national_dex_number: number;
    generation: number;
    capture_rate: number;
    base_happiness: number;
    growth_rate: string;
    is_legendary: boolean;
    is_mythical: boolean;
    description: string | null;
  };
  height: number;
  weight: number;
  base_experience: number;
  sprites: {
    front: string | null;
    back: string | null;
    shiny_front: string | null;
    shiny_back: string | null;
  };
  stats: {
    hp: number;
    attack: number;
    defense: number;
    special_attack: number;
    special_defense: number;
    speed: number;
  } | null;
  types: Array<{ slot: number; name: string }>;
  abilities: Array<{ slot: number; name: string; effect: string | null }>;
};

export type PokemonMove = {
  id: string;
  game_id: GameId;
  move: { id: string; name: string; type?: string; power?: number | null; accuracy?: number | null; pp?: number | null; description?: string | null };
  learn_method: string;
  level_learned: number | null;
};

export type PokemonEncounter = {
  id: string;
  game_id: GameId;
  game_name: string;
  location: { id: string; name: string; slug: string };
  method: string;
  min_level: number;
  max_level: number;
  encounter_rate: number | null;
  conditions: unknown;
  validation_status: string;
};

export type EvolutionResponse = {
  data_available: boolean;
  evolutions: Array<{
    id: string;
    from_species: { id: string; name: string };
    to_species: { id: string; name: string };
    item?: { id: string; name: string } | null;
    trigger?: string | null;
    min_level?: number | null;
    condition?: unknown;
  }>;
};

export type TeamMember = {
  id: string;
  teamId: string;
  pokemonId: string;
  slot: number;
  level: number | null;
  nature: string | null;
  isShiny: boolean;
  pokemon?: { id: string; name: string; spriteFront?: string | null };
};

export type Team = {
  id: string;
  userId: string;
  gameId: GameId;
  name: string;
  description: string | null;
  isFavorite: boolean;
  game?: { id: GameId; name: string };
  members: TeamMember[];
};

export type DamageResult = {
  min_damage: number;
  max_damage: number;
  type_effectiveness: number;
  modifiers: {
    critical: boolean;
    burned: boolean;
    weather: string;
    screen: string;
    stab: boolean;
    weather_multiplier: number;
    screen_multiplier: number;
  };
  assumptions: string[];
};

export type Item = {
  id: string;
  name: string;
  category: string;
  effect: string | null;
  evolution_count: number;
};

export type CollectionEntry = {
  id: string;
  pokemon_id: string;
  pokemon_name: string;
  status: "SEEN" | "CAUGHT" | "OWNED" | "WANTED";
  is_shiny: boolean;
  nickname: string | null;
  notes: string | null;
  updated_at: string;
};

export type Quest = {
  id: string;
  name: string;
  description: string | null;
  reward: unknown;
  steps: Array<{ id: string; step_number: number; title: string; description?: string | null; completion_condition?: unknown }>;
};

export type ChecklistCategory = {
  id: string;
  category: string;
  title: string;
  sort_order: number;
  items: Array<{ id: string; title: string; description: string | null; sort_order: number }>;
};

export type HelperMessage = {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export type HelperConversation = {
  id: string;
  gameId: GameId | null;
  title: string | null;
  messages: HelperMessage[];
};

export type Credits = {
  game_id: GameId | null;
  sources: Array<{
    source_id: string;
    name: string;
    url: string;
    organization: string | null;
    license_notes: string | null;
    credit_text: string;
    retrieved_at: string | null;
  }>;
};

export type AdminQualityIssue = {
  id: string;
  targetType: string;
  targetId: string;
  severity: string;
  status: string;
  description: string;
};

export type AdminReport = {
  id: string;
  targetType: string;
  targetId: string;
  status: string;
  reason: string;
  description: string | null;
};

export type AdminSource = {
  id: string;
  name: string;
  sourceType: string;
  url: string;
  organization: string | null;
  licenseNotes: string | null;
  creditText: string;
};
