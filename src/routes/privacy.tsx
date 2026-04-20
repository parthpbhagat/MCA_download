import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — MCA Download" },
      { name: "description", content: "Privacy policy for mcadownload.com including information collection, data sharing, and security measures." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 py-16 px-4 md:px-8">
        <div className="container mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold text-center text-[#1d69d7] mb-12 underline underline-offset-8">Privacy</h1>
          
          <div className="space-y-12">
            <section className="space-y-4">
               <h2 className="text-xl font-bold text-foreground border-b-2 border-[#1d69d7]/10 pb-2">Privacy</h2>
               <p className="text-muted-foreground leading-relaxed">
                  What follows is the privacy policy followed at mcadownload.com. Please go through it carefully. This privacy policy may change at any time and without notice. Your continued use of the website indicates an acceptance of the policy as existing at that time.
               </p>
            </section>

            <section className="space-y-6">
              <div className="space-y-3">
                <h3 className="font-bold text-foreground flex gap-3">
                  <span className="text-[#1d69d7]">1.</span> Information Collection:
                </h3>
                <div className="text-muted-foreground leading-relaxed pl-8 space-y-4">
                  <p>
                    We collect information about visitors using standard web-logging methods, including cookies. This includes information like pages accessed, time of access, your IP address, referring website/URL, browser details (user-agent), etc.
                  </p>
                  <p>
                    For users who use social login on our website (currently through Facebook and Google authentication), we receive and store the corresponding email address, name and basic public profile information as provided by the service providers. Note that when using these services, we never receive user passwords and therefore do not and cannot store them on our servers.
                  </p>
                  <p>
                    For accounts created on mcadownload, passwords are never stored in plain text. In fact, we cannot recover the passwords from the information stored on our servers. Only specially processed versions of the password are stored (hashed versions) and hence are much safer.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-foreground flex gap-3">
                  <span className="text-[#1d69d7]">2.</span> Data Sharing:
                </h3>
                <div className="text-muted-foreground leading-relaxed pl-8 space-y-4">
                  <p>
                    We do not share visitor information with third-parties. For example, even when using login using Facebook or Google, no information about the pages you access on our website is relayed back to them. However, data may be shared with other related companies/entities for the purpose of development of marketing methods, website improvements, etc. Such information as we collect might be shared with the Government in case we are legally required to do so.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-foreground flex gap-3">
                  <span className="text-[#1d69d7]">3.</span> Data Security:
                </h3>
                <div className="text-muted-foreground leading-relaxed pl-8 space-y-4">
                  <p>
                    We make strong efforts to safeguard any information we collect about our users. Passwords are never stored in plaintext and employee access to sensitive information is limited. For purchases made on our website through the payment gateway, credit/debit card details are never stored on our servers. We only store transaction authorization data while card details are recorded with the merchant bank.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-foreground flex gap-3">
                  <span className="text-[#1d69d7]">4.</span> System Security:
                </h3>
                <div className="text-muted-foreground leading-relaxed pl-8 space-y-4">
                  <p>
                    All reasonable efforts are made to appropriately firewall our servers and prevent unauthorized access to any machines/databases containing sensitive information.
                  </p>
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
