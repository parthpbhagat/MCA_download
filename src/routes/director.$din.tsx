import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, User, Calendar, Globe } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { directorsApi } from "@/lib/api/directors";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/director/$din")({
  loader: async ({ params }) => {
    const d = await directorsApi.getByDin(params.din);
    if (!d) throw notFound();
    return d;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.name} (DIN ${loaderData.din}) — MCAVault` },
          { name: "description", content: `Director ${loaderData.name} is associated with ${loaderData.companies.length} companies.` },
        ]
      : [{ title: "Director — MCAVault" }],
  }),
  errorComponent: () => <DirectorError />,
  notFoundComponent: () => <DirectorError notFound />,
  component: DirectorPage,
});

function DirectorError({ notFound }: { notFound?: boolean } = {}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="container mx-auto flex flex-1 items-center justify-center px-4 py-20 text-center">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{notFound ? "Director not found" : "Failed to load"}</h1>
          <Link to="/directors" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">← Back to directors</Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function DirectorPage() {
  const d = Route.useLoaderData();
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-secondary/30">
        <div className="container mx-auto px-4 py-8">
          <Link to="/directors" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to directors
          </Link>

          <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[image:var(--gradient-hero)] text-primary-foreground">
                <User className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{d.name}</h1>
                <div className="mt-1 font-mono text-sm text-muted-foreground">DIN: {d.din}</div>
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-foreground/80">
                  <span><Calendar className="mr-1 inline h-4 w-4 text-muted-foreground" /> Appointed {formatDate(d.appointmentDate)}</span>
                  <span><Globe className="mr-1 inline h-4 w-4 text-muted-foreground" /> {d.nationality}</span>
                  {d.dateOfBirth && <span>DOB {formatDate(d.dateOfBirth)}</span>}
                </div>
              </div>
            </div>
          </div>

          <h2 className="mt-8 mb-3 text-lg font-semibold text-foreground">Associated Companies ({d.companies.length})</h2>
          <div className="space-y-3">
            {(d.companies as { cin: string; name: string; designation: string }[]).map((c) => (
              <Link
                key={c.cin}
                to="/company/$cin"
                params={{ cin: c.cin }}
                className="block rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)] transition-[var(--transition-smooth)] hover:border-primary/30 hover:shadow-[var(--shadow-elegant)]"
              >
                <div className="font-semibold text-foreground">{c.name}</div>
                <div className="mt-0.5 font-mono text-xs text-muted-foreground">{c.cin}</div>
                <div className="mt-1 text-xs text-primary">{c.designation}</div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
