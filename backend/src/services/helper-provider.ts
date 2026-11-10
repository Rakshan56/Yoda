export type HelperMessage = { role: "user" | "assistant"; content: string };
export type HelperProvider = { answer(messages: HelperMessage[]): Promise<string> };

export class UnconfiguredHelperProvider implements HelperProvider {
  async answer(): Promise<string> {
    throw new Error("No LLM helper provider is configured.");
  }
}

export const createHelperProvider = (): HelperProvider => new UnconfiguredHelperProvider();
