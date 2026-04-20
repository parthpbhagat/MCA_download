import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — MCA Data Hub" },
      { name: "description", content: "Simple, transparent pricing for MCA company data. Get V2 and V3 documents at affordable rates." },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  const navigate = useNavigate();
  const [pricing, setPricing] = useState<any[]>([]);

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

  const handleBuyNow = async (plan: any) => {
    const isLoggedIn = localStorage.getItem("is_logged_in") === "true";
    if (!isLoggedIn) {
      toast.error("Please login to purchase a subscription");
      navigate({ to: "/login" });
      return;
    }

    const isLoaded = await loadRazorpay();
    if (!isLoaded) {
      toast.error("Failed to load Razorpay SDK");
      return;
    }

    try {
      // Create backend Order
      const amount = parseInt(plan.price.replace(/\D/g, ""));
      const res = await fetch("http://localhost:8000/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Could not create order");

      // Configure Razorpay checkout
      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: "MCA Data Hub",
        description: `Subscription: ${plan.title}`,
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
              localStorage.setItem("is_subscribed", "true");
              toast.success("Payment successful! Your subscription is active.");
              navigate({ to: "/dashboard" });
            } else {
              toast.error("Payment verification failed. Contact support.");
            }
          } catch (e) {
             toast.error("Payment verification process failed.");
          }
        },
        prefill: {
          name: "User",
          email: "user@example.com",
          contact: "9999999999"
        },
        theme: { color: "#1d69d7" }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (e: any) {
      toast.error(e.message || "Failed to start payment process");
    }
  };

  useEffect(() => {
    fetch("http://localhost:8000/api/settings")
      .then(r => r.json())
      .then(d => {
        if (d && d.pricing && d.pricing.length > 0) {
          setPricing(d.pricing);
        } else {
          // Fallback if empty
          setPricing([{ title: "COMPANY V2/V3", price: "153", features: ["Falllback loaded"] }]);
        }
      })
      .catch(e => console.error("Failed to load Pricing", e));
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 py-12 md:py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="space-y-12">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-foreground opacity-90 uppercase tracking-widest animate-fade-up opacity-0">Document Pricing</h2>
              <div className="h-1.5 w-24 bg-primary mx-auto mt-4 rounded-full animate-scale-in opacity-0 delay-100" />
            </div>

            <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto animate-fade-up opacity-0 delay-200">
              {pricing.map((plan: any, i: number) => {
                const isPrimary = i % 2 !== 0;
                return (
                  <div key={i} className={`rounded-2xl p-10 flex flex-col items-center text-center shadow-xl hover:shadow-2xl transition-all h-full ${isPrimary ? 'bg-[#1d69d7] transform hover:scale-[1.02]' : 'bg-white dark:bg-card border border-border'}`}>
                    <h3 className={`${isPrimary ? 'text-white' : 'text-[#104a8e] dark:text-primary'} font-bold text-lg mb-8 tracking-wide uppercase`}>
                      {plan.title}
                    </h3>
    
                    <div className={`flex items-start mb-2 ${isPrimary ? 'text-white' : ''}`}>
                      <span className={`${isPrimary ? 'text-white' : 'text-[#1d69d7]'} text-2xl font-medium mt-2`}>₹</span>
                      <span className={`${isPrimary ? 'text-white' : 'text-[#1d69d7]'} text-7xl font-bold leading-none`}>{plan.price}</span>
                      <span className={`${isPrimary ? 'text-white/70' : 'text-muted-foreground'} text-sm self-end mb-2 ml-1`}>/ company</span>
                    </div>
    
                    <p className={`${isPrimary ? 'text-white/60' : 'text-muted-foreground'} text-xs font-medium mb-8`}>Including GST</p>
    
                    <div className={`space-y-4 mb-10 ${isPrimary ? 'text-white/90' : 'text-muted-foreground'} font-medium`}>
                      {(plan.features || []).map((feature: string, fi: number) => (
                        <p key={fi}>{feature}</p>
                      ))}
                    </div>
    
                    <Button
                      onClick={() => handleBuyNow(plan)}
                      variant="outline"
                      className={`w-full max-w-[200px] h-12 text-sm font-bold transition-all shadow-sm rounded-md ${isPrimary ? 'border-white text-white hover:bg-white hover:text-[#1d69d7] bg-transparent' : 'border-[#1d69d7] text-[#1d69d7] hover:bg-[#1d69d7] hover:text-white'}`}
                    >
                      Buy Now
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
