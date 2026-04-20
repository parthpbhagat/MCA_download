import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — MCA Download" },
      { name: "description", content: "Terms of service and usage conditions for mcadownload.com dataset and platform." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 py-16 px-4 md:px-8">
        <div className="container mx-auto max-w-5xl prose prose-blue dark:prose-invert">
          <h1 className="text-4xl font-bold text-[#1d69d7] mb-12 underline underline-offset-8">Terms & Conditions</h1>
          
          <div className="space-y-10 text-muted-foreground leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">General</h2>
              <p>
                The MCADownload’s Dataset (the “Dataset”) is a structured set of data, text, media files, products, information about businesses, products, people, trademarks and more (the “Content”) and includes such Content displayed and/or otherwise contained on the Site. You will use the data only for your end-use requirements. You shall not scrape, resell, reverse-engineer, copy, quote or sell, license or redistribute this data in any manner. The MCADownload Platform (the “Platform”) provides access to the Dataset through the MCADownload website (the “Site”), its affiliates or related parties websites, mobile applications, API, data exports, browser plugins, reports and widgets. The MCADownload Platform and MCADownload Dataset (together, the “Service”) is operated by IDEA IDEAS and its related third parties, (hereinafter referred to as “MCADownload”).
              </p>
              <p>
                 The user is referred to as “You”. If the user is an individual, You means such individual. If the user is a corporation, partnership or other entity (“Corporate Entity”), You refers to such Corporate Entity and the individual represents and warrants that the individual has the authority to bind the Corporate Entity.
              </p>
              <p>
                By accessing or using the Service, You acknowledge that You have read, understand and agree to be legally bound by these Terms of Service (“Terms of Service” or “Agreement”) and you represent that you have the legal capacity to be bound by these Terms of Use whether or not You have a registered account for the Service.
              </p>
              <p>
                Notwithstanding anything in the Terms of Service to the contrary, your rights to use certain material available on or through this Site may be subject to separate written license agreements with MCADownload (“Other Agreements”). In the event you have an Other Agreement to access all or any portion of the Site, including any separately entitled sections of the Site, then the Other Agreement, rather than these Terms of Service, will govern your use of the Site. In the event of a conflict between your Other Agreement and these Terms of Service, the terms and conditions in the Other Agreement shall prevail.
              </p>
              <p>
                 Any attempt by you to modify these Terms of Service is expressly rejected by MCADownload and shall have no force or effect regarding your use of the Site. MCADownload reserves the right, at any time, to add to, change, update, or modify these Terms of Service, simply by posting such change, update, or modification on the Site and without any other notice to You. Any such change, update, or modification will be effective immediately upon posting on the Site. It is Your responsibility to review these Terms of Service from time to time to ensure that You continue to agree with all of its terms.
              </p>
              <p>
                 Please read these Terms of Service carefully as they contain important information regarding Your legal rights, remedies and obligations. These Terms of Service establish the rights that MCADownload and others in the user community will have in and to any content that You contribute to the MCADownload’s Dataset.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Use of the Site</h2>
              <p>
                MCADownload grants you a personal, revocable, non-exclusive, non-transferable, limited license to access and use the Site and the Content conditioned upon your compliance with these Terms of Service.
              </p>
              <p>
                You may not license, sublicense, transfer, sell, resell, publish, reproduce, and/or otherwise redistribute the Site, including the Content or any component thereof in any manner (including, but not limited to, via or as part of any Internet site). You may not: a) use the Content or any portion of the Site as part of any intranet or other internal network; b) create archival or derivative works based on the Content or any portion thereof; or c) modify, reverse-engineer, disassemble, decompile or store the Content or any portion of the Site. You may not use the Site for any illegal purpose or in any manner inconsistent with these Terms of Service. MCADownload may discontinue or change the Site and the Content, or their availability to you, at any time; however, MCADownload is not under any obligation to update the Content following publication on the Site. The terms of these Terms of Use will survive any such discontinuation.
              </p>
            </section>

            <section className="space-y-4">
               <h2 className="text-2xl font-bold text-foreground">Your Contributions to MCADownload</h2>
               <p>
                  If You create or modify any content on MCADownload, You agree to: (a) provide accurate and current information; (b) maintain the security of Your password and identification if You have one; (c) be fully responsible for all use of Your account and for any actions that take place using Your account.
               </p>
               <p>
                  By contributing or posting any content on the Service (“Your Content”), You grant MCADownload and our assigns, agents, and licensees the non-exclusive, irrevocable, royalty-free, perpetual, worldwide license, with the right to sublicense through multiple tiers of sub-licensees, to use, reproduce, modify, display, perform, and distribute Your Content in any medium and form of technology now known or hereafter developed. You should not upload any content in which You do not have sufficient rights to grant this license.
               </p>
               <p>
                  MCADownload owns all rights, title, and interests in intellectual property rights in any contributions by its employees, any derivative works developed by MCADownload and the compilations and collective works in the MCADownload Dataset, including works incorporating Your Content (but not rights to Your Content alone).
               </p>
               <p>
                  The MCADownload Dataset benefits from content submitted by anonymous users, registered users, partners, and MCADownload staff. This information may be inaccurate or out-of-date. MCADownload assumes no responsibility for the accuracy of the information in the Service. Use such information at Your own risk.
               </p>
               <p>
                  MCADownload shall not be responsible for any failure to remove, or delay in removing, harmful, inaccurate, unlawful, or otherwise objectionable content from the Service. MCADownload has no responsibility or liability for the deletion or failure to store or display contributed content.
               </p>
               <p>
                  The MCADownload Dataset may be changed, updated, or deleted without notice at MCADownload’s sole discretion.
               </p>
            </section>

            <section className="space-y-4">
               <h2 className="text-2xl font-bold text-foreground">Non-Commercial Use of the MCADownload Dataset</h2>
               <p>
                  We provide the MCADownload Dataset under the Creative Commons Attribution-Non Commercial License [CC-BY-NC]. This license applies to information provided in the dataset, including structured data, text and media files.
               </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Attribution</h2>
              <p>
                 Attribution must clearly state that the Content is sourced from the MCADownload Dataset and link to the source material on the Site.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                 <li>Example for a specific entity: Source: NAME on MCADownload</li>
                 <li>Example for multiple entities: Source: MCADownload</li>
              </ul>
              <p>If you have any questions regarding attribution, contact: <a href="mailto:support@mcadownload.com" className="text-primary hover:underline">support@mcadownload.com</a></p>
            </section>

            <section className="space-y-4">
               <h2 className="text-2xl font-bold text-foreground">Accessing the MCADownload Platform</h2>
               <p>
                  MCADownload may provide different ways to access parts of the Service: data export, API, browser plugin, etc. You agree to: - Access only through permitted methods - Not use crawlers, spiders, or scraping tools - Comply with these Terms and API rules Authorized use of the API is permitted; scraping the website is not.
               </p>
               <p>
                  MCADownload will use commercially reasonable efforts to provide 24/7 access but is not liable for disruptions or inaccuracies.
               </p>
            </section>

            <section className="space-y-4">
               <h2 className="text-2xl font-bold text-foreground">User Conduct</h2>
               <p>
                  You agree not to upload harmful, illegal, abusive, infringing, defamatory, obscene, or unauthorized content. You may not impersonate others, solicit minors, upload viruses, spam, or use another user’s account without permission.
               </p>
            </section>

            <section className="space-y-4">
               <h2 className="text-2xl font-bold text-foreground">Payments, Cancellations & Refunds</h2>
               <p>
                  All reports, data and content purchased on MCADownload are non-refundable and non-cancellable. If ordered items are not delivered, MCADownload will refund only those specific undelivered items.
               </p>
            </section>

            <section className="space-y-4">
               <h2 className="text-2xl font-bold text-foreground">Proprietary Rights</h2>
               <p>
                  This Site and Service are protected by copyright, trademark and other laws. You may not reproduce, modify, sell, transfer, publicly perform, or distribute any part of the Site without permission.
               </p>
            </section>

            <section className="space-y-4 text-sm bg-secondary/20 p-6 rounded-xl border border-border">
               <p className="font-bold text-foreground mb-4">Governing Law</p>
               <p>These Terms are governed by the laws of India. Jurisdiction: Courts of Delhi, India.</p>
               <p className="mt-4 font-bold text-foreground">Contact: <a href="mailto:support@mcadownload.com" className="text-primary hover:underline">support@mcadownload.com</a></p>
            </section>

            <section className="space-y-4">
               <h2 className="text-2xl font-bold text-foreground text-destructive">Resale</h2>
               <p className="font-medium text-foreground">
                  Resale of data from MCADownload is strictly prohibited without written consent. Violation may result in termination without refund.
               </p>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
