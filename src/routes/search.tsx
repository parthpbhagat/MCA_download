import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Download, Loader2 } from "lucide-react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { StatusBadge } from "@/components/status-badge";
import { companiesApi } from "@/lib/api/companies";
import type { Company, CompanyStatus, SearchParams } from "@/lib/types";
import { formatDate, formatINR } from "@/lib/format";

const STATUSES: CompanyStatus[] = ["Active", "Strike Off", "Under Liquidation", "Dormant", "Amalgamated", "Dissolved"];
const STATES = ["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Gujarat", "Rajasthan", "West Bengal"];

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>) => ({
    q: (s.q as string) ?? "",
    status: s.status as CompanyStatus | undefined,
    state: s.state as string | undefined,
    page: Number(s.page) || 1,
  }),
  head: () => ({
    meta: [
      { title: "Company Search — MCAVault" },
      { name: "description", content: "Search Indian companies by CIN, name, status or state. Instant results from MCA master data." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [q, setQ] = useState(search.q);
  const [results, setResults] = useState<Company[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!search.q) {
      setResults([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    setQ(search.q);
    setLoading(true);
    const params: SearchParams = {
      q: search.q,
      status: search.status,
      state: search.state,
      page: search.page,
      limit: 20,
    };
    
    companiesApi.search(params)
      .then((res) => {
        setResults(res.data);
        setTotal(res.total);
      })
      .catch((err) => {
        console.error("Search failed:", err);
        setResults([]);
        setTotal(0);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [search.q, search.status, search.state, search.page]);

  const updateSearch = (patch: Partial<typeof search>) =>
    navigate({
      to: "/search",
      search: (prev: typeof search) => ({ ...prev, ...patch, page: 1 }),
    });

  const exportCsv = () => {
    const csv = Papa.unparse(results);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mcavault-companies-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-secondary/30">
        <div className="container mx-auto px-4 py-8">
          <h1 className="mb-1 text-2xl font-bold text-foreground">Company Search</h1>
          <p className="mb-6 text-sm text-muted-foreground">Search master data of Indian companies registered with MCA.</p>

          {/* Filters */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateSearch({ q });
              }}
              className="flex flex-col gap-3 md:flex-row"
            >
              <div className="flex flex-1 items-center gap-2 rounded-md border border-input bg-background px-3">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Company name or CIN…"
                  className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                />
              </div>
              <Select
                value={search.status ?? "all"}
                onValueChange={(v) => updateSearch({ status: v === "all" ? undefined : (v as CompanyStatus) })}
              >
                <SelectTrigger className="md:w-44"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select
                value={search.state ?? "all"}
                onValueChange={(v) => updateSearch({ state: v === "all" ? undefined : v })}
              >
                <SelectTrigger className="md:w-44"><SelectValue placeholder="State" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All states</SelectItem>
                  {STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button type="submit">Search</Button>
            </form>
          </div>
          {/* Results Table */}
          <div className="mt-8 overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
            {loading ? (
              <div className="flex h-64 flex-col items-center justify-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Searching MCA master data...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border bg-secondary/50 font-medium text-muted-foreground">
                    <tr>
                      <th className="px-6 py-3">CIN/LLPIN</th>
                      <th className="px-6 py-3">Company Name</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {results.map((c) => (
                      <tr key={c.cin} className="group hover:bg-secondary/30 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs font-medium text-foreground">
                          {c.cin}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {c.name || (c as any).companyName}
                          </div>
                          <div className="text-[11px] text-muted-foreground uppercase tracking-wider">
                            {c.state} • {c.category || "Entity"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="sm" asChild className="h-8">
                            <Link to={`/company/${c.cin}`}>View Details</Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : q ? (
              <div className="flex h-64 flex-col items-center justify-center gap-2 p-8 text-center">
                <div className="rounded-full bg-secondary p-3">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">No companies found</h3>
                  <p className="text-sm text-muted-foreground">Try a different search term or check for typos.</p>
                </div>
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center text-muted-foreground">
                Enter a search term above to begin.
              </div>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
