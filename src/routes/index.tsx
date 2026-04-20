import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search, Building2, Users, FileText, Download, ShieldCheck, Zap, Layers, Palette, Command, Fingerprint, ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { formatNumber } from "@/lib/format";
import { mockAnalytics } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MCAVault — India MCA Master Company Data Search" },
      { name: "description", content: "Search 25 lakh+ Indian companies and 41 lakh+ directors from MCA master data. CIN lookup, charges, filings & instant CSV export." },
      { property: "og:title", content: "MCAVault — India MCA Master Company Data" },
      { property: "og:description", content: "Search 25 lakh+ Indian companies and 41 lakh+ directors. Instant CIN lookup, charges, filings & CSV export." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const [faqs, setFaqs] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/settings")
      .then(r => r.json())
      .then(d => {
        if (d && d.faq) setFaqs(d.faq);
      })
      .catch(e => console.error("Failed to load FAQs", e));
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-[image:var(--gradient-hero)] py-20 text-primary-foreground">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
          <div className="container relative mx-auto px-4 text-center">
            <h1 className="mx-auto max-w-3xl text-balance text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl animate-fade-up opacity-0">
              India's MCA Master Data, Searchable in Seconds
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-balance text-base text-primary-foreground/85 md:text-lg animate-fade-up opacity-0 delay-100">
              Lookup any registered Indian company by CIN or name. Access directors,
              charges, filings, and full master data — sourced from MCA21.
            </p>

{/*
            <form
              onSubmit={(e) => {
                e.preventDefault();
                navigate({ to: "/dashboard", search: { q } as any });
              }}
              className="mx-auto mt-8 flex max-w-2xl gap-2 rounded-lg bg-background/95 p-2 shadow-[var(--shadow-elegant)] backdrop-blur dark:bg-card/95 animate-fade-up opacity-0 delay-200"
            >
              <div className="flex flex-1 items-center gap-2 px-3">
                <Search className="h-5 w-5 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by company name or CIN (e.g. L65190MH1994PLC080618)"
                  className="border-0 bg-transparent text-foreground shadow-none focus-visible:ring-0"
                />
              </div>
              <Button type="submit" size="lg" className="bg-primary text-white hover:bg-primary/90">
                Search
              </Button>
            </form>
*/}

            <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4 animate-scale-in opacity-0 delay-300">
              <Stat label="Companies" value={formatNumber(mockAnalytics.totalCompanies)} />
              <Stat label="Directors" value={formatNumber(mockAnalytics.totalDirectors)} />
              <Stat label="Daily Searches" value={formatNumber(mockAnalytics.totalSearches)} />
              <Stat label="Active Users" value={formatNumber(mockAnalytics.activeUsers)} />
            </div>
          </div>
        </section>

        {/* New Services Section */}
        <section className="relative py-24 overflow-hidden border-b border-border bg-secondary/20">
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='%231e40af' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E\")", backgroundSize: "30px 30px" }} />
          <div className="container relative mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="animate-fade-up opacity-0 delay-100">
                <ServiceCard 
                  icon={Layers} 
                  title="MCA Download" 
                  desc="MCADownload eases user activity of downloading individual documents from MCA and provides company information organised in folders as per their categories."
                />
              </div>
              <div className="animate-fade-up opacity-0 delay-200">
                <ServiceCard 
                  icon={Palette} 
                  title="CompData API" 
                  desc="API caters to all your data needs through API calls making the data sourcing easier from MCA data, EPFO, GST, Litigation."
                />
              </div>
              <div className="animate-fade-up opacity-0 delay-300">
                <ServiceCard 
                  icon={Command} 
                  title="Director Contact" 
                  desc="Find & reach your prospects or leads before your competitor does. Reach Directly to the Decision Maker / Board"
                />
              </div>
              <div className="animate-fade-up opacity-0 delay-500">
                <ServiceCard 
                  icon={Fingerprint} 
                  title="Detailed report" 
                  desc="In-depth most comprehensive report About Your Customers & Competitors includes, Financials, Auditors, Ratios, Shareholders, Ultimate Beneficiary Owner(UBO), Cap Table or Funding Info, Risk Assessment"
                />
              </div>
            </div>
          </div>
        </section>


        {/* FAQ Section */}
        <section id="faq" className="bg-card py-24 border-t border-border">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl font-bold text-primary text-center mb-12 tracking-wider uppercase">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div 
                  key={idx} 
                  className={`border rounded-lg transition-all duration-300 ${openFaq === idx ? 'bg-secondary/40 border-primary/20 shadow-sm' : 'bg-background border-border hover:border-accent/40'}`}
                >
                  <button 
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-6 text-left"
                  >
                    <div className="flex items-center gap-4">
                      <HelpCircle className={`h-5 w-5 ${openFaq === idx ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className={`font-semibold text-lg ${openFaq === idx ? 'text-primary' : 'text-foreground'}`}>
                        {faq.q}
                      </span>
                    </div>
                    {openFaq === idx ? (
                      <ChevronUp className="h-5 w-5 text-primary" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                  
                  {openFaq === idx && (
                    <div className="px-16 pb-8 text-muted-foreground leading-relaxed text-lg">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-primary-foreground/10 px-4 py-3 backdrop-blur">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs uppercase tracking-wider text-primary-foreground/80">{label}</div>
    </div>
  );
}

function ServiceCard({ icon: Icon, title, desc }: { icon: any; title: string, desc: string }) {
  return (
    <div className="bg-card p-8 rounded-2xl shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-all duration-500 flex flex-col items-start gap-6 border border-border hover:border-primary/20 group">
      <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-500">
        <Icon className="h-7 w-7" />
      </div>
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-muted-foreground leading-relaxed text-base">
          {desc}
        </p>
      </div>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  desc,
  link,
}: {
  icon: typeof Building2;
  title: string;
  desc: string;
  link: string;
}) {
  return (
    <Link
      to={link}
      className="group rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[var(--shadow-elegant)]"
    >
      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{desc}</p>
    </Link>
  );
}
