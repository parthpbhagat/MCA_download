import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Mail, Phone, MapPin, Building2 } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — MCA Download" },
      { name: "description", content: "Learn more about Technowire Data Science Private Limited, our certifications, and institutional support." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold text-center text-[#1d69d7] mb-16 underline underline-offset-8">About Us</h1>
          
          <div className="space-y-24">
            {/* Item 1 */}
            <section className="space-y-6 animate-fade-up opacity-0">
              <h2 className="text-lg font-medium text-foreground opacity-90">
                1. Intimation under clause (ii) of the proviso to Section 56(2)(viib) of the Income-tax Act, 1961
              </h2>
              <div className="rounded-xl border border-border overflow-hidden shadow-lg bg-white">
                <img 
                  src="/src/assets/income-tax-intimation.png" 
                  alt="Income Tax Intimation" 
                  className="w-full h-auto"
                />
              </div>
            </section>

            {/* Item 2 */}
            <section className="space-y-6 animate-fade-up opacity-0 delay-200">
              <h2 className="text-lg font-medium text-foreground opacity-90">2. Incubated at GUSEC</h2>
              <div className="rounded-xl border border-border overflow-hidden shadow-lg bg-white">
                <img 
                  src="/src/assets/gusec-certificate.png" 
                  alt="GUSEC Incubation Certificate" 
                  className="w-full h-auto"
                />
              </div>
            </section>

            {/* Item 3 */}
            <section className="space-y-6 animate-fade-up opacity-0 delay-300">
              <h2 className="text-lg font-medium text-foreground opacity-90">3. DIPP Registration Number : DIPP63027</h2>
              <div className="rounded-xl border border-border overflow-hidden shadow-lg bg-white">
                <img 
                  src="https://mcadownload.in/assets/img/about3.jpg" 
                  alt="DIPP Recognition Certificate" 
                  className="w-full h-auto"
                />
              </div>
            </section>

            {/* Contact Us */}
            <section className="pt-12 border-t border-border">
              <h2 className="text-3xl font-bold text-foreground mb-8">Contact Us</h2>
              <div className="grid gap-8 text-sm md:text-base">
                <div className="flex items-start gap-4">
                  <Building2 className="h-5 w-5 text-[#1d69d7] mt-1 shrink-0" />
                  <div>
                    <span className="font-bold text-foreground">Merchant Legal entity name:</span>
                    <span className="ml-2">Technowire Data Science Private Limited</span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <MapPin className="h-5 w-5 text-[#1d69d7] mt-1 shrink-0" />
                  <div>
                    <div className="mb-4">
                      <span className="font-bold text-foreground">Registered Address:</span>
                      <span className="ml-2">EIGHTEEN FLOOR, 1815, BLOCK-B, NAVRATNA CORPORATE PARK, OPP. JAYANTILAL PARK BOPAL ROAD, AMBLI, GUJARAT, PIN: 380058</span>
                    </div>
                    <div>
                      <span className="font-bold text-foreground">Operational Address:</span>
                      <span className="ml-2">EIGHTEEN FLOOR, 1815, BLOCK-B, NAVRATNA CORPORATE PARK, OPP. JAYANTILAL PARK BOPAL ROAD, AMBLI, GUJARAT, PIN: 380058</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Phone className="h-5 w-5 text-[#1d69d7] mt-1 shrink-0" />
                  <div>
                    <span className="font-bold text-foreground">Telephone No:</span>
                    <span className="ml-2 text-[#b91c1c]">9328527395</span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Mail className="h-5 w-5 text-[#1d69d7] mt-1 shrink-0" />
                  <div>
                    <span className="font-bold text-foreground">E-Mail ID:</span>
                    <a href="mailto:technowire@outlook.com" className="ml-2 text-[#1d69d7] hover:underline">technowire@outlook.com</a>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
