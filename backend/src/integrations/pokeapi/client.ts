import { env } from "../../config/env.js";

export class PokeApiClient {
  constructor(private readonly baseUrl = env.POKEAPI_BASE_URL, private readonly timeoutMs = env.POKEAPI_TIMEOUT_MS) {}

  async get<T>(path: string): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await fetch(`${this.baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`, { signal: controller.signal });
      if (!response.ok) throw new Error(`PokeAPI returned ${response.status} for ${path}`);
      return await response.json() as T;
    } finally {
      clearTimeout(timeout);
    }
  }
}

export const pokeApi = new PokeApiClient();
