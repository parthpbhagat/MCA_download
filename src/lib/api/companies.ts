import type {
  Company,
  Charge,
  Filing,
  PaginatedResponse,
  SearchParams,
} from "../types";
import {
  mockCompanies,
  mockCharges,
  mockFilings,
} from "../mock-data";
import { apiFetch, delay, USE_MOCK } from "./client";

export const companiesApi = {
  async search(params: SearchParams): Promise<PaginatedResponse<Company>> {
    if (USE_MOCK) {
      await delay();
      const q = (params.q ?? "").toLowerCase().trim();
      let filtered = mockCompanies.filter((c) => {
        const matchesQ =
          !q ||
          c.name.toLowerCase().includes(q) ||
          c.cin.toLowerCase().includes(q);
        const matchesStatus = !params.status || c.status === params.status;
        const matchesState = !params.state || c.state === params.state;
        return matchesQ && matchesStatus && matchesState;
      });
      const page = params.page ?? 1;
      const limit = params.limit ?? 20;
      const start = (page - 1) * limit;
      return {
        data: filtered.slice(start, start + limit),
        total: filtered.length,
        page,
        limit,
      };
    }
    const qs = new URLSearchParams(
      Object.entries(params).reduce<Record<string, string>>((acc, [k, v]) => {
        if (v !== undefined && v !== "") acc[k] = String(v);
        return acc;
      }, {}),
    ).toString();
    return apiFetch(`/companies?${qs}`);
  },

  async getByCin(cin: string): Promise<Company | null> {
    if (USE_MOCK) {
      await delay();
      return mockCompanies.find((c) => c.cin === cin) ?? null;
    }
    return apiFetch(`/companies/${encodeURIComponent(cin)}`);
  },

  async getCharges(cin: string): Promise<Charge[]> {
    if (USE_MOCK) {
      await delay();
      return mockCharges.filter((c) => c.cin === cin);
    }
    return apiFetch(`/companies/${encodeURIComponent(cin)}/charges`);
  },

  async getFilings(cin: string): Promise<Filing[]> {
    if (USE_MOCK) {
      await delay();
      return mockFilings.filter((f) => f.cin === cin);
    }
    return apiFetch(`/companies/${encodeURIComponent(cin)}/filings`);
  },

  async create(input: Omit<Company, never>): Promise<Company> {
    if (USE_MOCK) {
      await delay();
      mockCompanies.unshift(input);
      return input;
    }
    return apiFetch(`/admin/companies`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async update(cin: string, patch: Partial<Company>): Promise<Company> {
    if (USE_MOCK) {
      await delay();
      const idx = mockCompanies.findIndex((c) => c.cin === cin);
      if (idx >= 0) mockCompanies[idx] = { ...mockCompanies[idx], ...patch };
      return mockCompanies[idx];
    }
    return apiFetch(`/admin/companies/${encodeURIComponent(cin)}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
  },

  async remove(cin: string): Promise<void> {
    if (USE_MOCK) {
      await delay();
      const idx = mockCompanies.findIndex((c) => c.cin === cin);
      if (idx >= 0) mockCompanies.splice(idx, 1);
      return;
    }
    await apiFetch(`/admin/companies/${encodeURIComponent(cin)}`, {
      method: "DELETE",
    });
  },
};
