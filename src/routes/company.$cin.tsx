import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Building2, MapPin, Calendar, IndianRupee, Mail, FileText, Landmark, Lock } from "lucide-react";
import { usePurchase } from "@/hooks/use-purchase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { StatusBadge } from "@/components/status-badge";
import { BuyNowPanel } from "@/components/buy-now-panel";
import { companiesApi } from "@/lib/api/companies";
import { formatDate, formatINR } from "@/lib/format";
import type { Charge, Filing } from "@/lib/types";

export const Route = createFileRoute("/company/$cin")({
  loader: async ({ params }) => {
    const company = await companiesApi.getByCin(params.cin);
    if (!company) throw notFound();
    const [charges, filings] = await Promise.all([
      companiesApi.getCharges(params.cin),
      companiesApi.getFilings(params.cin),
    ]);
    return { company, charges, filings };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.company.name} — MCAVault` },
          { name: "description", content: `Master data, directors, charges and filings for ${loaderData.company.name} (CIN: ${loaderData.company.cin}).` },
          { property: "og:title", content: `${loaderData.company.name} — MCAVault` },
          { property: "og:description", content: `${loaderData.company.status} • ${loaderData.company.roc} • Incorporated ${loaderData.company.incorporationDate}` },
        ]
      : [{ title: "Company — MCAVault" }],
  }),
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="container mx-auto flex flex-1 items-center justify-center px-4 py-20 text-center">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Failed to load company</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
          <Link to="/search" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">← Back to search</Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  ),
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="container mx-auto flex flex-1 items-center justify-center px-4 py-20 text-center">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Company not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">No company with this CIN exists in our records.</p>
          <Link to="/search" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">← Back to search</Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  ),
  component: CompanyPage,
});

function CompanyPage() {
  const { company, charges, filings } = Route.useLoaderData();
  const { purchased } = usePurchase(company.cin);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-secondary/30">
        <div className="container mx-auto px-4 py-8">
          <Link to="/search" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to search
          </Link>

          {/* Company header — name + CIN always visible */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[image:var(--gradient-hero)] text-primary-foreground">
                <Building2 className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground md:text-2xl">{company.name}</h1>
                  {purchased && <StatusBadge status={company.status} />}
                  {purchased && <Badge variant="secondary">{company.category}</Badge>}
                </div>
                <div className="mt-1 font-mono text-sm text-muted-foreground">{company.cin}</div>
              </div>
            </div>
          </div>

          {/* Buy Now panel */}
          <BuyNowPanel companyName={company.name} cin={company.cin} />

          {/* Locked notice when not purchased */}
          {!purchased && (
            <div className="mt-6 rounded-xl border border-dashed border-border bg-card p-10 text-center shadow-[var(--shadow-card)]">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                <Lock className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-base font-semibold text-foreground">Master data locked</h2>
              <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                Status, ROC, capital, registered address, charges and filings for this company
                are available after purchase. Use the Buy Now panel above to unlock.
              </p>
            </div>
          )}

          {/* Premium content — visible only after purchase */}
          {purchased && (
            <>
              <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <InfoRow icon={Landmark} label="ROC" value={company.roc} />
                  <InfoRow icon={MapPin} label="State" value={company.state} />
                  <InfoRow icon={Calendar} label="Incorporation Date" value={formatDate(company.incorporationDate)} />
                  <InfoRow icon={IndianRupee} label="Authorized Capital" value={formatINR(company.authorizedCapital)} />
                  <InfoRow icon={IndianRupee} label="Paid-up Capital" value={formatINR(company.paidUpCapital)} />
                  {company.email && <InfoRow icon={Mail} label="Email" value={company.email} />}
                  <InfoRow icon={Calendar} label="Last AGM" value={formatDate(company.lastAgmDate)} />
                  <InfoRow icon={FileText} label="Last Filing" value={formatDate(company.lastFilingDate)} />
                </div>

                <div className="mt-6 rounded-md border border-border bg-secondary/40 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Registered Address</div>
                  <div className="mt-1 text-sm text-foreground">{company.registeredAddress}</div>
                </div>

                <div className="mt-3 rounded-md border border-border bg-secondary/40 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Industry</div>
                  <div className="mt-1 text-sm text-foreground">{company.industry}</div>
                </div>
              </div>

              <Tabs defaultValue="charges" className="mt-6">
                <TabsList>
                  <TabsTrigger value="charges">Charges ({charges.length})</TabsTrigger>
                  <TabsTrigger value="filings">Filings ({filings.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="charges" className="mt-4">
                  {charges.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">No charges registered.</div>
                  ) : (
                    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
                      <table className="w-full text-sm">
                        <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
                          <tr>
                            <th className="px-4 py-3 text-left">Charge ID</th>
                            <th className="px-4 py-3 text-left">Charge Holder</th>
                            <th className="px-4 py-3 text-right">Amount</th>
                            <th className="px-4 py-3 text-left">Created</th>
                            <th className="px-4 py-3 text-left">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {(charges as Charge[]).map((c) => (
                            <tr key={c.chargeId} className="hover:bg-secondary/40">
                              <td className="px-4 py-3 font-mono text-xs">{c.chargeId}</td>
                              <td className="px-4 py-3 font-medium text-foreground">{c.holderName}</td>
                              <td className="px-4 py-3 text-right font-medium">{formatINR(c.amount)}</td>
                              <td className="px-4 py-3 text-muted-foreground">{formatDate(c.creationDate)}</td>
                              <td className="px-4 py-3">
                                <Badge variant="outline" className={c.status === "Open" ? "border-warning/40 bg-warning/15 text-warning-foreground" : "border-success/30 bg-success/15 text-success"}>
                                  {c.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="filings" className="mt-4">
                  {filings.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">No filings on record.</div>
                  ) : (
                    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
                      <table className="w-full text-sm">
                        <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
                          <tr>
                            <th className="px-4 py-3 text-left">Form Type</th>
                            <th className="px-4 py-3 text-left">Description</th>
                            <th className="px-4 py-3 text-left">Filing Date</th>
                            <th className="px-4 py-3 text-left">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {(filings as Filing[]).map((f) => (
                            <tr key={f.id} className="hover:bg-secondary/40">
                              <td className="px-4 py-3 font-mono text-xs font-semibold text-primary">{f.formType}</td>
                              <td className="px-4 py-3 text-foreground">{f.description}</td>
                              <td className="px-4 py-3 text-muted-foreground">{formatDate(f.filingDate)}</td>
                              <td className="px-4 py-3">
                                <Badge variant={f.status === "Approved" ? "default" : f.status === "Pending" ? "secondary" : "destructive"}>{f.status}</Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Building2; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="truncate text-sm font-medium text-foreground">{value}</div>
      </div>
    </div>
  );
}
