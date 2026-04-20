import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Mail, ChevronRight, Loader2, Building2, Layers } from "lucide-react";
import { SiteHeader } from "@/components/site-chrome";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { companiesApi } from "@/lib/api/companies";
import type { Company } from "@/lib/types";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — MCA Download" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Company[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [bulkCins, setBulkCins] = useState("");
  const [isBulkSearching, setIsBulkSearching] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced live search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (q.trim().length >= 2) {
        setIsSearching(true);
        try {
          const res = await companiesApi.search({ q, limit: 6 });
          setResults(res.data || []);
          setShowDropdown(true);
        } catch (error) {
          console.error("Live search failed:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [q]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBulkSearch = async () => {
    const cins = bulkCins.split(/[\s,]+/).filter(c => c.trim().length > 5);
    if (cins.length === 0) {
      toast.error("Please enter at least one valid CIN");
      return;
    }

    setIsBulkSearching(true);
    try {
      const res = await fetch(`http://localhost:8000/api/bulk-lookup?cins=${cins.join(",")}`);
      const data = await res.json();
      
      if (data && data.data) {
        const found = data.data.filter((c: any) => !c.error && c.name !== "Not Found");
        if (found.length === 0) {
          toast.error("No companies found for the provided CINs");
        } else {
          toast.success(`Found ${found.length} companies!`);
          // Navigate to checkout with multiple companies
          // We'll use the first CIN as the main param and pass full list in state/storage
          localStorage.setItem("bulk_checkout_companies", JSON.stringify(found));
          navigate({ 
            to: "/checkout/$cin", 
            params: { cin: found[0].cin },
            search: { name: found[0].name, bulk: "true" } as any
          });
        }
      }
    } catch (error) {
      console.error("Bulk lookup failed:", error);
      toast.error("Failed to lookup CINs. Please try again.");
    } finally {
      setIsBulkSearching(false);
      setIsBulkModalOpen(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <SiteHeader />
      <main className="flex-1 flex flex-col py-12 px-4 relative z-10">
        <div className="container mx-auto max-w-6xl flex-1 flex flex-col pt-10">
          <div className="flex flex-col items-center animate-fade-up opacity-0">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (q.trim()) {
                    setShowDropdown(false);
                    navigate({ to: "/search", search: { q } });
                  }
                }}
                className="w-full max-w-6xl mb-12 relative"
                ref={dropdownRef}
              >
                 <div className="flex gap-2">
                    <div className="flex-1 relative">
                       <Input 
                         value={q}
                         onChange={(e) => {
                           setQ(e.target.value);
                           setShowDropdown(true);
                           setSelectedIndex(-1);
                         }}
                         onKeyDown={(e) => {
                           if (!showDropdown || results.length === 0) return;
                           if (e.key === "ArrowDown") {
                             e.preventDefault();
                             setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
                           } else if (e.key === "ArrowUp") {
                             e.preventDefault();
                             setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
                           } else if (e.key === "Enter") {
                             if (selectedIndex >= 0 && selectedIndex < results.length) {
                               e.preventDefault();
                               const company = results[selectedIndex];
                               setQ(company.name);
                               setShowDropdown(false);
                               navigate({ 
                                 to: "/checkout/$cin", 
                                 params: { cin: company.cin },
                                 search: { name: company.name } as any
                               });
                             }
                           }
                         }}
                         placeholder="Search for a company (e.g., TATA)" 
                         className="h-12 w-full rounded-md border border-border bg-white text-foreground pl-4 pr-10 shadow-sm focus:ring-1 focus:ring-primary dark:bg-card"
                       />
                       {isSearching && (
                         <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <Loader2 className="h-5 w-5 animate-spin" />
                         </div>
                       )}
                    </div>
                    <Button type="submit" className="h-12 px-10 bg-primary hover:bg-primary/90 text-white font-medium rounded-md shadow-sm transition-all active:scale-95">
                       Search
                    </Button>
                 </div>

                 {/* Autocomplete Dropdown */}
                 {showDropdown && (q.trim().length >= 2) && (
                   <div className="absolute top-14 left-0 right-[128px] bg-white dark:bg-card border border-border rounded-md shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-1">
                     {isSearching && results.length === 0 ? (
                       <div className="p-4 text-center text-sm text-muted-foreground">
                         Searching live database...
                       </div>
                     ) : results.length > 0 ? (
                       <ul className="max-h-[300px] overflow-y-auto py-1">
                         {results.map((company, index) => (
                           <li 
                             key={company.cin}
                             onMouseEnter={() => setSelectedIndex(index)}
                             onClick={() => {
                               setQ(company.name);
                               setShowDropdown(false);
                               navigate({ 
                                 to: "/checkout/$cin", 
                                 params: { cin: company.cin },
                                 search: { name: company.name } as any
                               });
                             }}
                             className={`px-4 py-3 cursor-pointer flex items-start gap-3 transition-colors border-b border-border/50 last:border-0 ${selectedIndex === index ? "bg-accent" : "hover:bg-accent"}`}
                           >
                              <div className="mt-0.5 bg-primary/10 p-1.5 rounded-md text-primary">
                                <Building2 className="h-4 w-4" />
                              </div>
                              <div className="flex flex-col overflow-hidden">
                                <span className="font-medium text-foreground truncate">{company.name}</span>
                                <div className="flex items-center gap-2 text-xs mt-1">
                                  <span className="text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm">{company.cin}</span>
                                  <span className={`px-1.5 py-0.5 rounded-sm font-medium ${company.status?.toLowerCase().includes('active') ? 'text-green-600 bg-green-100 dark:bg-green-900/30' : 'text-amber-600 bg-amber-100 dark:bg-amber-900/30'}`}>
                                    {company.status || "Unknown"}
                                  </span>
                                </div>
                              </div>
                           </li>
                         ))}
                       </ul>
                     ) : (
                       <div className="p-4 text-center text-sm text-muted-foreground">
                         No companies found matching "{q}"
                       </div>
                     )}
                   </div>
                 )}
              </form>
                
              <div className="mt-2 border border-border/60 rounded-md p-6 bg-white/50 dark:bg-card/50 delay-100 w-full max-w-6xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                  <p className="text-foreground font-medium opacity-90 tracking-tight flex items-center gap-2">
                     <Search className="h-4 w-4 text-primary" />
                     Start typing to see live company suggestions pulled directly from Finanvo API.
                  </p>
                  
                  <Dialog open={isBulkModalOpen} onOpenChange={setIsBulkModalOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2 border-primary/20 hover:bg-primary/5">
                        <Layers className="h-4 w-4 text-primary" />
                        Bulk CIN Search
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Bulk CIN Search</DialogTitle>
                        <DialogDescription>
                          Enter multiple CIN numbers separated by commas or new lines.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <Textarea 
                          placeholder="L65190MH1994PLC080618&#10;U72200KA2000PTC026340"
                          className="min-h-[200px] font-mono text-sm"
                          value={bulkCins}
                          onChange={(e) => setBulkCins(e.target.value)}
                        />
                      </div>
                      <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsBulkModalOpen(false)}>Cancel</Button>
                        <Button 
                          onClick={handleBulkSearch} 
                          disabled={isBulkSearching || !bulkCins.trim()}
                        >
                          {isBulkSearching ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Searching...
                            </>
                          ) : "Search & Checkout"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
               </div>
          </div>
        </div>
      </main>

      <footer className="bg-[#f8fafc] dark:bg-card/30 border-t border-border py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand / Contact */}
            <div className="space-y-6 animate-fade-up opacity-0 delay-100">
              <h1 className="text-3xl font-light text-[#1e40af] dark:text-primary">MCADownload</h1>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p className="font-bold text-foreground opacity-80">Technowire DataScience Pvt. Ltd.</p>
                <div className="flex gap-2">
                   <MapPin className="h-4 w-4 shrink-0 mt-1" />
                   <span>
                      EIGHTEEN FLOOR, 1815, BLOCK-B, NAVRATNA CORPORATE PARK,<br />
                      OPP. JAYANTILAL PARK BOPAL ROAD, AMBLI,<br />
                      GUJARAT, PIN: 380058, India
                   </span>
                </div>
                <div className="flex items-center gap-2">
                   <Mail className="h-4 w-4" />
                   <span>Email:<span className="text-primary italic ml-1">technowire@outlook.com</span></span>
                </div>
              </div>
            </div>

            {/* Information */}
            <div className="space-y-6 animate-fade-up opacity-0 delay-200">
              <h3 className="text-base font-bold text-[#1e40af] dark:text-primary tracking-wide">Information</h3>
              <ul className="space-y-4">
                <FooterLink text="Lead Database" />
                <FooterLink text="Business Development" />
                <FooterLink text="Risk Analysis" />
                <FooterLink text="Credit Assessment" />
                <FooterLink text="Due Diligence" />
              </ul>
            </div>

            {/* Analysis */}
            <div className="space-y-6 animate-fade-up opacity-0 delay-300">
              <h3 className="text-base font-bold text-[#1e40af] dark:text-primary tracking-wide">Analysis</h3>
              <ul className="space-y-4">
                <FooterLink text="Ultimate Beneficiary Owner(UBO)" />
                <FooterLink text="Investor Infomration" />
                <FooterLink text="Alerts and WatchLists" />
                <FooterLink text="Detailed Reports" />
                <FooterLink text="Screener" />
              </ul>
            </div>

            {/* Services */}
            <div className="space-y-6 animate-fade-up opacity-0 delay-500">
              <h3 className="text-base font-bold text-[#1e40af] dark:text-primary tracking-wide">Services</h3>
              <ul className="space-y-4">
                <FooterLink text="Company Data Download" />
                <FooterLink text="LLP Data Download" />
                <FooterLink text="Detailed Reports" />
                <FooterLink text="Director Contact Details" />
                <FooterLink text="GSTIN / EPF / Trademarks" />
              </ul>
            </div>
          </div>

          <div className="mt-16 border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
             <div className="flex items-center gap-4">
                <span className="hover:text-primary cursor-pointer">About Us</span>
                <span className="opacity-30">|</span>
                <span className="hover:text-primary cursor-pointer">Privacy Policy</span>
                <span className="opacity-30">|</span>
                <span className="hover:text-primary cursor-pointer">Terms & Conditions</span>
             </div>
             <div>
                © {new Date().getFullYear()} Technowire DataScience Pvt. Ltd. All Rights Reserved.
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterLink({ text }: { text: string }) {
   return (
      <li className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors group">
         <ChevronRight className="h-3.5 w-3.5 text-primary group-hover:translate-x-1 transition-transform" />
         {text}
      </li>
   );
}
