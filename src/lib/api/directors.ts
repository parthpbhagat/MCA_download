import type { Director } from "../types";
import { mockDirectors } from "../mock-data";
import { apiFetch, delay, USE_MOCK } from "./client";

export const directorsApi = {
  async search(query: string): Promise<Director[]> {
    if (USE_MOCK) {
      await delay();
      const q = query.toLowerCase().trim();
      if (!q) return mockDirectors;
      return mockDirectors.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.din.includes(q),
      );
    }
    return apiFetch(`/directors?q=${encodeURIComponent(query)}`);
  },

  async getByDin(din: string): Promise<Director | null> {
    if (USE_MOCK) {
      await delay();
      return mockDirectors.find((d) => d.din === din) ?? null;
    }
    return apiFetch(`/directors/${encodeURIComponent(din)}`);
  },
};
