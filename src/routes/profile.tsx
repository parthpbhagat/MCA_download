import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, FormEvent, useEffect } from "react";
import { User, Mail, Phone, MapPin, Shield, Bell, Settings } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — MCA Data Hub" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
     email: localStorage.getItem("temp_login_email") || "parthpbhagat@gmail.com",
     displayName: localStorage.getItem("profile_displayName") || "parthpbhagat",
     fullName: localStorage.getItem("profile_fullName") || "",
     designation: localStorage.getItem("profile_designation") || "",
     companyName: localStorage.getItem("profile_companyName") || "",
     mobile: localStorage.getItem("profile_mobile") || "9011494385",
     website: localStorage.getItem("profile_website") || "",
     gst: localStorage.getItem("profile_gst") || "",
     city: localStorage.getItem("profile_city") || "",
     address: localStorage.getItem("profile_address") || ""
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      // Save data locally
      Object.entries(formData).forEach(([key, val]) => {
         localStorage.setItem("profile_" + key, val);
      });
      localStorage.setItem("profile_completed", "true");
      localStorage.setItem("is_logged_in", "true");
      
      toast.success("Profile saved!", { description: "You are now fully signed in." });
      setLoading(false);
      navigate({ to: "/dashboard" });
    }, 600);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 py-12 px-4 md:px-8">
        <div className="container mx-auto max-w-7xl">
          <h1 className="text-2xl font-medium text-foreground mb-8 opacity-80">My Profile</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Row 1 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground opacity-70">Email <span className="text-red-500">*</span></label>
                <Input 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  readOnly 
                  className="bg-secondary/50 border-border h-11 text-muted-foreground focus-visible:ring-0" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground opacity-70">Display Name <span className="text-red-500">*</span></label>
                <Input 
                  value={formData.displayName} 
                  onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                  required
                  className="h-11 border-border focus-visible:ring-1 focus-visible:ring-primary" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground opacity-70">Full Name</label>
                <Input 
                  value={formData.fullName} 
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="h-11 border-border focus-visible:ring-1 focus-visible:ring-primary" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground opacity-70">Designation</label>
                <Input 
                  value={formData.designation} 
                  onChange={(e) => setFormData({...formData, designation: e.target.value})}
                  className="h-11 border-border focus-visible:ring-1 focus-visible:ring-primary" 
                />
              </div>

              {/* Row 2 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground opacity-70">Company Name</label>
                <Input 
                  value={formData.companyName} 
                  onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                  className="h-11 border-border focus-visible:ring-1 focus-visible:ring-primary" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground opacity-70">Mobile</label>
                <Input 
                  value={formData.mobile} 
                  onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                  className="h-11 border-border focus-visible:ring-1 focus-visible:ring-primary" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground opacity-70">Website</label>
                <Input 
                  value={formData.website} 
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  className="h-11 border-border focus-visible:ring-1 focus-visible:ring-primary" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground opacity-70">GST Number</label>
                <Input 
                  value={formData.gst} 
                  onChange={(e) => setFormData({...formData, gst: e.target.value})}
                  className="h-11 border-border focus-visible:ring-1 focus-visible:ring-primary" 
                />
              </div>

              {/* Row 3 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground opacity-70">City</label>
                <Input 
                  value={formData.city} 
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="h-11 border-border focus-visible:ring-1 focus-visible:ring-primary" 
                />
              </div>
              <div className="md:col-span-3 space-y-2">
                <label className="text-sm font-medium text-foreground opacity-70">Address</label>
                <textarea 
                  value={formData.address} 
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary min-h-[100px] resize-none"
                />
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" disabled={loading} className="bg-[#1d69d7] hover:bg-[#1557b5] text-white px-8 h-10 rounded-md font-medium shadow-sm transition-all">
                {loading ? "Saving..." : "Submit"}
              </Button>
            </div>
          </form>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
