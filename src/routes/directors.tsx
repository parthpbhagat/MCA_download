import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { directorsApi } from "@/lib/api/directors";
import type { Director } from "@/lib/types";

export const Route = createFileRoute("/directors")({
  head: () => ({
    meta: [
      { title: "Director Lookup — MCAVault" },
      { name: "description", content: "Search Indian directors by DIN or name. View all companies they're associated with." },
    ],
  }),
  component: DirectorsPage,
});

function DirectorsPage() {
  const [q, setQ] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [results, setResults] = useState<Director[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    directorsApi.search(submitted).then((r) => {
      setResults(r);
      setLoading(false);
    });
  }, [submitted]);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-secondary/30">
        <div className="container mx-auto px-4 py-8">
          <h1 className="mb-1 text-2xl font-bold text-foreground">Director Lookup</h1>
          <p className="mb-6 text-sm text-muted-foreground">Find directors by DIN or name. See every company they're linked to.</p>

          <form
            onSubmit={(e) => { e.preventDefault(); setSubmitted(q); }}
            className="flex gap-2 rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-card)]"
          >
            <div className="flex flex-1 items-center gap-2 px-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="DIN (e.g. 00012345) or name…"
                className="border-0 bg-transparent shadow-none focus-visible:ring-0"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>

          <div className="mt-6 space-y-3">
            {loading && (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading…
              </div>
            )}
            {!loading && results.map((d) => (
              <Link
                key={d.din}
                to="/director/$din"
                params={{ din: d.din }}
                className="block rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)] transition-[var(--transition-smooth)] hover:border-primary/30 hover:shadow-[var(--shadow-elegant)]"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-foreground">{d.name}</div>
                    <div className="font-mono text-xs text-muted-foreground">DIN: {d.din}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {d.designation} • Active in {d.companies.length} {d.companies.length === 1 ? "company" : "companies"}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            {!loading && results.length === 0 && (
              <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
                No directors found.
              </div>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
