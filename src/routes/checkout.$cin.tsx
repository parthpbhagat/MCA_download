import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-chrome";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TrendingUp, X, Loader2, Layers } from "lucide-react";

export const Route = createFileRoute("/checkout/$cin")({
  component: CheckoutPage,
});

function CheckoutPage() {
  const { cin } = Route.useParams();
  const navigate = useNavigate();
  
  // Safely extract company name if passed in query parameters
  const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const initialCompanyName = searchParams.get("name") || "Unknown Company";

  const [companies, setCompanies] = useState(() => {
    if (typeof window !== "undefined") {
      const bulkCompanies = localStorage.getItem("bulk_checkout_companies");
      if (bulkCompanies) {
         try {
           const parsed = JSON.parse(bulkCompanies);
           if (Array.isArray(parsed) && parsed.length > 0) {
             return parsed;
           }
         } catch (e) {
           console.error("Failed to parse bulk companies", e);
         }
      }
    }
    return [{ cin, name: initialCompanyName }];
  });
  const [orderFor, setOrderFor] = useState("V2 Documents");
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  
  // Search state
  const [q, setQ] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Billing states
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [description, setDescription] = useState("DOWN_DOCS");
  const [gstin, setGstin] = useState("");
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [billingSettings, setBillingSettings] = useState({ rate: 145.00, gstPercent: 18 });

  useEffect(() => {
    // Clean up bulk search to avoid re-populating on refresh
    if (typeof window !== "undefined") {
      localStorage.removeItem("bulk_checkout_companies");
    }

    // Automatically set email/mobile if logged in
    setEmail(localStorage.getItem("profile_email") || localStorage.getItem("temp_login_email") || "customer@example.com");
    setMobile(localStorage.getItem("profile_mobile") || "");
    // Fetch settings for billing
    fetch("http://localhost:8000/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data && data.billing) {
           setBillingSettings(data.billing);
        }
      })
      .catch(err => console.error("Failed to load settings:", err));
  }, []);

  // Search logic
  useEffect(() => {
    if (q.trim().length >= 2) {
      setIsSearching(true);
      setShowDropdown(true);
      setSelectedIndex(-1);
      const timer = setTimeout(() => {
        fetch(`http://localhost:8000/companies?q=${encodeURIComponent(q)}`)
          .then(res => res.json())
          .then(data => {
            if (data && Array.isArray(data.data)) {
              setResults(data.data.slice(0, 6));
            } else if (Array.isArray(data)) {
              setResults(data.slice(0, 6));
            }
          })
          .catch(err => console.error("Search error:", err))
          .finally(() => setIsSearching(false));
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setResults([]);
      setShowDropdown(false);
    }
  }, [q]);

  // Handle clicking outside of dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Dynamic Calculation
  const quantity = companies.length;
  const rate = billingSettings.rate;
  const subTotal = rate * quantity;
  const gstPercent = billingSettings.gstPercent;
  const gst = subTotal * (gstPercent / 100);
  const total = subTotal + gst; 

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBuyNow = () => {
    const isLoggedIn = localStorage.getItem("is_logged_in") === "true";
    if (!isLoggedIn) {
      toast.error("Please login to complete the purchase");
      navigate({ to: "/login" });
      return;
    }
    if (companies.length === 0) {
      toast.error("Please select at least one company to proceed.");
      return;
    }
    setPaymentModalOpen(true);
  };

  const processPayment = async () => {
    setPaymentModalOpen(false); // Close our custom modal first
    const isLoaded = await loadRazorpay();
    if (!isLoaded) {
      toast.error("Failed to load Razorpay SDK");
      return;
    }

    try {
      const amount = Math.round(total);
      const res = await fetch("http://localhost:8000/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Could not create order");

      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: "MCA Data Hub",
        description: `Order: ${orderFor} for ${quantity} companies`,
        order_id: data.order_id,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("http://localhost:8000/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            if (verifyRes.ok) {
              toast.success(`Payment successful! Check your orders.`);
              
              // Save real orders to localStorage (one per company for accurate history)
              const pastOrders = JSON.parse(localStorage.getItem("my_orders") || "[]");
              
              companies.forEach(company => {
                pastOrders.unshift({
                  id: response.razorpay_order_id + "-" + company.cin.substring(0, 4),
                  companyName: company.name,
                  cin: company.cin,
                  item: orderFor,
                  date: new Date().toISOString(),
                  amount: rate + (rate * (gstPercent / 100)), // individual cost
                  status: "Completed"
                });

                // Trigger Email sending API for EACH
                fetch("http://localhost:8000/api/send-document-email", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                     user_email: email,
                     company_name: company.name,
                     cin: company.cin,
                     document_type: orderFor
                  })
                }).catch(e => console.error(e));
              });

              localStorage.setItem("my_orders", JSON.stringify(pastOrders));

              // Simulate a file download after 1 second for the bulk ZIP
              setTimeout(() => {
                toast.success("Downloading bulk package...");
                const blob = new Blob(["Bulk documents downloaded for " + quantity + " companies."], { type: "text/plain" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `Bulk_Order_${response.razorpay_order_id}.txt`;
                a.click();
                window.URL.revokeObjectURL(url);
              }, 1500);

              navigate({ to: "/orders" });
            } else {
              toast.error("Payment verification failed. Contact support.");
            }
          } catch (e) {
             toast.error("Payment verification process failed.");
          }
        },
        prefill: {
          name: localStorage.getItem("profile_displayName") || "User",
          email: email,
          contact: mobile || "9999999999"
        },
        theme: { color: "#1877f2" }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (e: any) {
      toast.error(e.message || "Failed to start payment process");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f0f4f8] font-sans">
      <SiteHeader />
      
      <main className="flex-1 flex justify-center py-12 px-4 w-full">
        <div className="w-full">
          
          {/* Main Workspace matching user screenshot */}
          <div className="bg-white p-8 rounded shadow-sm border border-border/50">
            
            {/* Search Box */}
            <div className="relative mb-10 w-full" ref={dropdownRef}>
               <div className="flex shadow-sm rounded-md border border-slate-300 overflow-hidden outline-none focus-within:ring-2 focus-within:ring-[#1877f2]/50">
                   <Input 
                    value={q} 
                    onChange={e => { setQ(e.target.value); setSelectedIndex(-1); }} 
                    onKeyDown={e => {
                      if (!showDropdown || results.length === 0) return;
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
                      } else if (e.key === "ArrowUp") {
                        e.preventDefault();
                        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
                      } else if (e.key === "Enter" && selectedIndex >= 0) {
                        e.preventDefault();
                        const r = results[selectedIndex];
                        if(!companies.find(c => c.cin === r.cin)) {
                           setCompanies([...companies, { cin: r.cin, name: r.name }]);
                        } else {
                           toast.info("Company already added.");
                        }
                        setQ("");
                        setShowDropdown(false);
                        setSelectedIndex(-1);
                      }
                    }}
                    placeholder="Search for a company to add..." 
                    className="border-0 shadow-none focus-visible:ring-0 rounded-none h-12 text-[15px]" 
                  />
                  {q && (
                    <button 
                      onClick={() => setQ("")} 
                      className="px-3 hover:bg-slate-50 flex items-center justify-center text-slate-400"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                  <Button className="rounded-none bg-[#1877f2] hover:bg-[#166fe5] text-white px-8 h-12 text-[15px] cursor-pointer">
                    {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                  </Button>
               </div>
               
               {/* Search Dropdown */}
               {showDropdown && results.length > 0 && (
                 <div className="absolute top-14 left-0 right-0 bg-white border border-slate-200 shadow-xl z-50 rounded-md overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="bg-slate-50 p-2 px-4 border-b border-slate-100 flex justify-between items-center">
                       <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Search Results</span>
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         className="h-7 text-[11px] font-bold text-[#1877f2] hover:bg-[#1877f2]/10 px-2"
                         onClick={() => {
                           const newComps = results.filter(r => !companies.find(c => c.cin === r.cin));
                           if (newComps.length > 0) {
                             setCompanies([...companies, ...newComps.map(r => ({ cin: r.cin, name: r.name }))]);
                             toast.success(`Added ${newComps.length} companies.`);
                           }
                           setQ("");
                           setShowDropdown(false);
                         }}
                       >
                         Add All Results
                       </Button>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                       {results.map((r, i) => (
                          <div 
                            key={r.cin} 
                            className={`p-3.5 cursor-pointer border-b border-slate-100 last:border-0 transition-colors ${i === selectedIndex ? "bg-slate-100" : "hover:bg-slate-50"}`}
                            onMouseEnter={() => setSelectedIndex(i)}
                            onClick={() => {
                               if(!companies.find(c => c.cin === r.cin)) {
                                  setCompanies([...companies, { cin: r.cin, name: r.name }]);
                               } else {
                                  toast.info("Company already added.");
                               }
                               setQ("");
                               setShowDropdown(false);
                               setSelectedIndex(-1);
                            }}
                          >
                            <div className="font-bold text-[14px] text-slate-800">{r.name}</div>
                            <div className="text-[12px] text-slate-500 font-mono mt-0.5">{r.cin}</div>
                          </div>
                       ))}
                    </div>
                 </div>
               )}
            </div>

            {/* Bulk Add Button */}
            <div className="flex justify-end mb-6">
               <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2 text-slate-600 border-slate-200">
                      <Layers className="h-4 w-4" />
                      Bulk Add Companies
                    </Button>
                  </DialogTrigger>
                  <BulkSearchContent onAdd={(newCompanies) => {
                    setCompanies(prev => {
                      const existingCins = new Set(prev.map(c => c.cin));
                      const filtered = newCompanies.filter(c => !existingCins.has(c.cin));
                      if (filtered.length > 0) {
                        toast.success(`Added ${filtered.length} companies.`);
                        return [...prev, ...filtered];
                      } else if (newCompanies.length > 0) {
                        toast.info("All companies already in list.");
                      }
                      return prev;
                    });
                    setBulkDialogOpen(false);
                  }} />
               </Dialog>
            </div>

            {/* Selected Companies List */}
            <div className="space-y-4 mb-12">
              {companies.map(c => (
                <div key={c.cin} className="flex flex-row items-center justify-between p-4 border border-slate-200 rounded-[3px] bg-white hover:border-[#1877f2]/40 transition-colors">
                  <div className="flex flex-col">
                    <div className="font-bold text-[13px] text-slate-800 uppercase tracking-tight">{c.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-1 tracking-tight">{c.cin}</div>
                  </div>
                  <button 
                    onClick={() => setCompanies(companies.filter(x => x.cin !== c.cin))} 
                    className="p-1.5 hover:bg-slate-100 rounded text-slate-500 transition-colors"
                    title="Remove company"
                  >
                     <X className="w-5 h-5 opacity-70" strokeWidth={2.5} />
                  </button>
                </div>
              ))}
              
              {companies.length === 0 && (
                 <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-300 rounded text-slate-500 text-sm">
                    No companies selected. Search and add companies above to proceed.
                 </div>
              )}
            </div>

            {/* Billing Alignment matching screenshot */}
            <div className="flex justify-end">
               <div className="w-full max-w-[340px]">
                  
                  <div className="space-y-4 text-[14px] mb-6 font-medium text-slate-600">
                     <div className="flex items-center">
                        <span className="w-[120px] text-right pr-4">Order For :</span>
                        <select 
                          value={orderFor}
                          onChange={(e) => setOrderFor(e.target.value)}
                          className="flex-1 bg-slate-100/70 border border-slate-200 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-slate-300 px-3 py-1.5 text-slate-800 font-normal"
                        >
                           <option value="V2 Documents">V2 Documents</option>
                           <option value="V3 Documents">V3 Documents</option>
                        </select>
                     </div>
                     <div className="flex items-center">
                        <span className="w-[120px] text-right pr-4">Quantity :</span>
                        <span className="flex-1 text-slate-800">{quantity}</span>
                     </div>
                     <div className="flex items-center">
                        <span className="w-[120px] text-right pr-4">Rate :</span>
                        <span className="flex-1 text-slate-800">₹{rate.toFixed(2)}</span>
                     </div>
                     <div className="flex items-center">
                        <span className="w-[120px] text-right pr-4">Sub Total :</span>
                        <span className="flex-1 text-slate-800">₹{subTotal.toFixed(2)}</span>
                     </div>
                     <div className="flex items-center">
                        <span className="w-[120px] text-right pr-4">GST :</span>
                        <span className="flex-1 text-slate-800">({gstPercent}%) ₹{gst.toFixed(2)}</span>
                     </div>
                  </div>
                  
                  <div className="w-full h-px bg-slate-300 my-4" />
                  
                  <div className="flex items-center justify-center mt-4 mb-6">
                     <span className="w-[120px] text-right pr-4 text-[15px] font-bold text-slate-800">Total :</span>
                     <span className="flex-1 text-[15px] font-bold text-slate-900">₹{total.toFixed(2)}</span>
                  </div>

                  <Button 
                    className="w-full bg-[#1877f2] hover:bg-[#166fe5] text-white font-normal text-[15px] h-[42px] rounded-[4px] shadow-none transition-all active:scale-[0.98]"
                    onClick={handleBuyNow}
                    disabled={companies.length === 0}
                  >
                     Buy Now
                  </Button>
               </div>
            </div>

          </div>
        </div>
      </main>

      {/* Finanvo Mock Modal for additional details */}
      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-white gap-0 border-none rounded-md flex flex-col md:flex-row">
          {/* Left Column */}
          <div className="md:w-1/2 p-8 border-r border-[#e5e7eb] flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-[#7fb432] p-1.5 rounded flex items-center justify-center">
                <TrendingUp className="text-white w-6 h-6" strokeWidth={3} />
              </div>
              <span className="text-3xl font-extrabold tracking-tight text-slate-800 font-sans" style={{ letterSpacing: "-1px" }}>finanvo</span>
            </div>
            <div className="text-[28px] font-bold text-slate-800 mb-8 border-b border-slate-100 pb-8">
              Rs.{total.toFixed(0)}
            </div>
            
            <div className="space-y-5 mb-4 text-[14.5px] text-slate-600 font-medium">
              <div className="flex justify-between items-center">
                <span>Wallet Amount</span>
                <span>Rs.0</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Sub Total</span>
                <span>Rs.{subTotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">Tax <span className="text-[10px] bg-slate-100 rounded-full w-4 h-4 flex items-center justify-center text-slate-400 border border-slate-200">i</span></span>
                <span>Rs.{gst.toFixed(0)}</span>
              </div>
            </div>
            
            <div className="w-full h-px bg-slate-100 my-4" />
            
            <div className="flex justify-between font-bold text-[15px] text-slate-800 py-1 border-b border-slate-100 pb-6">
              <span>Total due today</span>
              <span>Rs.{total.toFixed(0)}</span>
            </div>
            
            <div className="mt-8 flex flex-col items-center text-[12px] space-y-1.5">
              <span className="text-slate-500">Powered by <span className="font-bold text-slate-800">Finanvo Payments</span></span>
            </div>
          </div>
          
          {/* Right Column */}
          <div className="md:w-1/2 p-8 bg-[#f9fafb] flex flex-col">
            <h3 className="text-slate-800 font-medium mb-6 text-[15px]">Contact information</h3>
            
            <div className="space-y-4 flex-1">
              <div>
                <label className="text-[11px] text-slate-500 mb-1 block">Email</label>
                <Input 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="customer@example.com" 
                  className="bg-white border-slate-200 shadow-none text-[14px] h-11 focus-visible:ring-1 focus-visible:ring-[#8b5cf6]" 
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 mb-1 block">Mobile</label>
                <Input 
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  className="bg-white border-slate-200 shadow-none text-[14px] h-11 focus-visible:ring-1 focus-visible:ring-[#8b5cf6]" 
                />
              </div>
              <div>
                 <label className="text-[11px] text-slate-500 mb-1 block">GSTIN <span className="opacity-70">(Optional)</span></label>
                <textarea 
                  value={gstin}
                  onChange={e => setGstin(e.target.value)}
                  placeholder=""
                  className="w-full bg-white border border-slate-200 shadow-none text-[14px] rounded-md p-3 h-20 resize-none focus:outline-none focus:ring-1 focus:ring-[#8b5cf6]"
                />
              </div>
            </div>
            
            <div className="space-y-3 mt-8">
              <Button 
                onClick={processPayment} 
                className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-[5px] h-[46px] font-medium shadow-sm transition-all"
              >
                Pay
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BulkSearchContent({ onAdd }: { onAdd: (companies: any[]) => void }) {
  const [bulkCins, setBulkCins] = useState("");
  const [isBulkSearching, setIsBulkSearching] = useState(false);
  const [open, setOpen] = useState(true);

  const handleBulkSearch = async () => {
    const lines = bulkCins.split(/[\s,]+/).filter(c => c.trim().length > 2);
    if (lines.length === 0) {
      toast.error("Please enter at least one CIN or Name");
      return;
    }

    setIsBulkSearching(true);
    const resolvedCompanies: any[] = [];
    const errors: string[] = [];

    try {
      // Separate CINs and likely Names
      const cins = lines.filter(l => /^[LU]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/.test(l) || /^[A-Z]{3}-\d{4}$/.test(l));
      const queries = lines.filter(l => !cins.includes(l));

      // Resolve CINs
      if (cins.length > 0) {
        const res = await fetch(`http://localhost:8000/api/bulk-lookup?cins=${cins.join(",")}`);
        const data = await res.json();
        if (data && data.data) {
          data.data.forEach((c: any) => {
            if (!c.error && c.name !== "Not Found" && c.name !== "Unknown") resolvedCompanies.push(c);
            else errors.push(`${c.cin} (${c.error || 'Not Found'})`);
          });
        } else if (data.error) {
          throw new Error(data.error);
        }
      }

      // Resolve Names (sequentially for now to avoid rate limiting, or parallel if we trust backend)
      for (const q of queries) {
        try {
          const res = await fetch(`http://localhost:8000/companies?q=${encodeURIComponent(q)}&limit=1`);
          const data = await res.json();
          const found = data.data?.[0] || data?.[0];
          if (found) {
            resolvedCompanies.push({ cin: found.cin, name: found.name });
          } else {
            errors.push(q);
          }
        } catch (e) {
          errors.push(q);
        }
      }

      if (resolvedCompanies.length > 0) {
        onAdd(resolvedCompanies);
        if (errors.length > 0) {
          toast.warning(`Added ${resolvedCompanies.length} companies. Could not find: ${errors.join(", ")}`);
        } else {
          toast.success(`Found and added ${resolvedCompanies.length} companies.`);
        }
      } else {
        toast.error("No companies found for the provided entries.");
      }
    } catch (error) {
      console.error("Bulk lookup failed:", error);
      toast.error("An error occurred during bulk search.");
    } finally {
      setIsBulkSearching(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Bulk Add Companies</DialogTitle>
        <DialogDescription>
          Enter CIN numbers or Company Names separated by commas or new lines.
        </DialogDescription>
      </DialogHeader>
      <div className="py-4">
        <Textarea 
          placeholder="Enter CINs here..."
          className="min-h-[200px] font-mono text-sm"
          value={bulkCins}
          onChange={(e) => setBulkCins(e.target.value)}
        />
      </div>
      <DialogFooter>
        <Button onClick={handleBulkSearch} disabled={isBulkSearching || !bulkCins.trim()}>
          {isBulkSearching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : "Add to List"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
