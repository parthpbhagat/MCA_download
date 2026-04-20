import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-chrome";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { TrendingUp } from "lucide-react";

export const Route = createFileRoute("/checkout/$cin")({
  component: CheckoutPage,
});

function CheckoutPage() {
  const { cin } = Route.useParams();
  const navigate = useNavigate();
  
  const [orderFor, setOrderFor] = useState("V2 Documents");
  const quantity = 1;
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [email, setEmail] = useState("parth@gmail.com");
  const [mobile, setMobile] = useState("");
  const [description, setDescription] = useState("DOWN_DOCS");
  const [gstin, setGstin] = useState("");

  // Fixed values exactly as requested by user's screenshot
  const rate = 145.00;
  const subTotal = rate * quantity;
  const gst = 26.00; // 18% of 145 is 26.1, but screenshot shows 26.00
  const total = 171.00; 

  // Safely extract company name if passed in query parameters
  const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const companyName = searchParams.get("name") || "Unknown Company";

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
        description: `Order: ${orderFor} - ${companyName}`,
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
              toast.success(`Payment successful! Check your orders for ${orderFor}.`);
              
              // Save real order to localStorage
              const newOrder = {
                 id: response.razorpay_order_id,
                 companyName,
                 cin: companyId,
                 item: orderFor,
                 date: new Date().toISOString(),
                 amount: total,
                 status: "Completed"
              };
              const pastOrders = JSON.parse(localStorage.getItem("my_orders") || "[]");
              pastOrders.unshift(newOrder);
              localStorage.setItem("my_orders", JSON.stringify(pastOrders));

              // Trigger Email sending API
              fetch("http://localhost:8000/api/send-document-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                   user_email: email || "customer@example.com",
                   company_name: companyName,
                   cin: companyId,
                   document_type: orderFor
                })
              }).then(r => r.json()).then(data => {
                if(data.status === "simulated") {
                  toast.info("Document dispatched (Simulated! Email password not set).");
                } else if(data.status === "success") {
                  toast.success("Document sent to your email!");
                }
              }).catch(e => console.error(e));

              // Simulate a file download after 1 second
              setTimeout(() => {
                toast.success("Downloading document...");
                const blob = new Blob(["This is a placeholder document for " + companyName + " - " + orderFor], { type: "text/plain" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${companyId}_${orderFor.replace(/\s+/g, "_")}.txt`;
                a.click();
                window.URL.revokeObjectURL(url);
              }, 1000);

              navigate({ to: "/orders" });
            } else {
              toast.error("Payment verification failed. Contact support.");
            }
          } catch (e) {
             toast.error("Payment verification process failed.");
          }
        },
        prefill: {
          name: "User",
          email: email,
          contact: mobile || "9999999999"
        },
        theme: { color: "#8b5cf6" }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (e: any) {
      toast.error(e.message || "Failed to start payment process");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans">
      <SiteHeader />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="bg-card border text-card-foreground shadow-sm w-full max-w-lg rounded-xl overflow-hidden">
          
          <div className="flex flex-col p-8 space-y-6">
             <div className="text-center mb-4">
                <h2 className="text-2xl font-bold tracking-tight text-slate-800">Complete Payment</h2>
                <div className="text-muted-foreground mt-3 flex flex-col items-center gap-1 text-[15px]">
                  <span>Target Company:</span>
                  <div className="font-semibold text-[#1e40af] bg-blue-50 px-3 py-1.5 rounded-md border border-blue-100 flex flex-col items-center">
                    <span className="text-sm">{companyName}</span>
                    <span className="text-xs opacity-70">({cin})</span>
                  </div>
                </div>
             </div>

             <div className="space-y-5 flex flex-col items-center w-full px-4">
                <div className="flex w-full items-center justify-between text-[15px]">
                   <span className="text-slate-600 font-medium">Order For :</span>
                   <select 
                     value={orderFor}
                     onChange={(e) => setOrderFor(e.target.value)}
                     className="w-[200px] border border-slate-200 rounded text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 px-3 py-1.5 shadow-sm bg-slate-50/50"
                   >
                      <option value="V2 Documents">V2 Documents</option>
                      <option value="V3 Documents">V3 Documents</option>
                   </select>
                </div>
                
                <div className="flex w-full items-center justify-between text-[15px]">
                   <span className="text-slate-600 font-medium">Quantity :</span>
                   <span className="w-[200px] text-left text-slate-800">{quantity}</span>
                </div>

                <div className="flex w-full items-center justify-between text-[15px]">
                   <span className="text-slate-600 font-medium">Rate :</span>
                   <span className="w-[200px] text-left text-slate-800">₹{rate.toFixed(2)}</span>
                </div>

                <div className="flex w-full items-center justify-between text-[15px]">
                   <span className="text-slate-600 font-medium">Sub Total :</span>
                   <span className="w-[200px] text-left text-slate-800">₹{subTotal.toFixed(2)}</span>
                </div>

                <div className="flex w-full items-center justify-between text-[15px]">
                   <span className="text-slate-600 font-medium">GST :</span>
                   <span className="w-[200px] text-left text-slate-800">18% (₹{gst.toFixed(2)})</span>
                </div>
             </div>

             <div className="w-full h-px bg-slate-200 my-4" />

             <div className="flex w-full items-center justify-center gap-2 text-lg mb-4">
                 <span className="font-bold text-slate-800">Total :</span>
                 <span className="font-bold text-slate-900 tracking-tight">₹{total.toFixed(2)}</span>
             </div>

             <Button 
               className="w-full bg-[#1877f2] hover:bg-[#166fe5] text-white font-medium text-[15px] h-12 rounded-md shadow-sm transition-all"
               onClick={handleBuyNow}
             >
                Buy Now
             </Button>
          </div>
        </div>
      </main>

      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-card gap-0 border-none rounded-md flex flex-col md:flex-row">
          {/* Left Column */}
          <div className="md:w-1/2 p-8 border-r border-border flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-[#7fb432] p-1.5 rounded flex items-center justify-center">
                <TrendingUp className="text-white w-6 h-6" strokeWidth={3} />
              </div>
              <span className="text-3xl font-extrabold tracking-tight text-foreground font-sans" style={{ letterSpacing: "-1px" }}>finanvo</span>
            </div>
            <div className="text-[28px] font-bold text-foreground mb-8 border-b border-border pb-8">
              Rs.{total.toFixed(0)}
            </div>
            
            <div className="space-y-5 mb-4 text-[14.5px] text-muted-foreground font-medium">
              <div className="flex justify-between items-center">
                <span>Wallet Amount</span>
                <span>Rs.0</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Sub Total</span>
                <span>Rs.{total.toFixed(0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">Tax <span className="text-[10px] bg-slate-100 rounded-full w-4 h-4 flex items-center justify-center text-slate-400 border border-slate-200">i</span></span>
                <span>Rs.0</span>
              </div>
            </div>
            
            <div className="w-full h-px bg-border my-4" />
            
            <div className="flex justify-between font-bold text-[15px] text-foreground py-1 border-b border-border pb-6">
              <span>Total due today</span>
              <span>Rs.{total.toFixed(0)}</span>
            </div>
            
            <div className="mt-8 flex flex-col items-center text-[12px] space-y-1.5">
              <span className="text-muted-foreground">Powered by <span className="font-bold text-foreground">Finanvo Payments</span></span>
              <span className="text-[#8b5cf6] font-semibold cursor-pointer hover:underline">Redirect to website</span>
            </div>
          </div>
          
          {/* Right Column */}
          <div className="md:w-1/2 p-8 bg-secondary/30 flex flex-col">
            <h3 className="text-foreground font-medium mb-6 text-[15px]">Contact information</h3>
            
            <div className="space-y-4 flex-1">
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">Email</label>
                <Input 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="parth@gmail.com" 
                  className="bg-background border-border shadow-none text-[14px] h-11 focus-visible:ring-1 focus-visible:ring-[#8b5cf6]" 
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">Mobile</label>
                <Input 
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  className="bg-background border-border shadow-none text-[14px] h-11 focus-visible:ring-1 focus-visible:ring-[#8b5cf6]" 
                />
              </div>
              <div>
                 <label className="text-[11px] text-muted-foreground mb-1 block">GSTIN <span className="opacity-70">(Optional)</span></label>
                <textarea 
                  value={gstin}
                  onChange={e => setGstin(e.target.value)}
                  placeholder=""
                  className="w-full bg-background border border-border shadow-none text-[14px] rounded-md p-3 h-20 resize-none focus:outline-none focus:ring-1 focus:ring-[#8b5cf6]"
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
              <Button 
                className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-[5px] h-[46px] font-medium shadow-sm transition-all"
                onClick={() => toast.info("Wallet payment selected")}
              >
                Pay by wallet
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
