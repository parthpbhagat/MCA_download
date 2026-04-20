import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { PlusCircle, Trash2, Save } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (e) {
      console.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        alert("Settings saved successfully!");
      } else {
        alert("Failed to save settings");
      }
    } catch (e) {
      alert("Error connecting to server");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading settings...</div>;
  if (!settings) return <div className="p-10 text-center text-red-500">Could not connect to backend to load settings.</div>;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 py-10 px-4 md:px-10 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <Button onClick={saveSettings} className="gap-2">
            <Save className="w-4 h-4" /> Save All Changes
          </Button>
        </div>

        <div className="grid gap-12">
          {/* FOOTER SETTINGS */}
          <section className="bg-card border border-border p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Footer Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-muted-foreground">Company Name / Footer Copyright Text</label>
                <Input
                  value={settings.footerText || ""}
                  onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
                />
              </div>
            </div>
          </section>

          {/* CONTACT INFO SETTINGS */}
          <section className="bg-card border border-border p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Contact Info Settings</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-muted-foreground">Company Name (in Address)</label>
                <Input
                  value={settings.contactInfo?.name || ""}
                  onChange={(e) => setSettings({ ...settings, contactInfo: { ...settings.contactInfo, name: e.target.value } })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-muted-foreground">Phone Number</label>
                <Input
                  value={settings.contactInfo?.phone || ""}
                  onChange={(e) => setSettings({ ...settings, contactInfo: { ...settings.contactInfo, phone: e.target.value } })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-muted-foreground">Email Address</label>
                <Input
                  value={settings.contactInfo?.email || ""}
                  onChange={(e) => setSettings({ ...settings, contactInfo: { ...settings.contactInfo, email: e.target.value } })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1 text-muted-foreground">Address</label>
                <textarea
                  className="w-full flex min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={settings.contactInfo?.address || ""}
                  onChange={(e) => setSettings({ ...settings, contactInfo: { ...settings.contactInfo, address: e.target.value } })}
                />
              </div>
            </div>
          </section>

          {/* FAQ SETTINGS */}
          <section className="bg-card border border-border p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">FAQ Settings</h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSettings({ ...settings, faq: [...(settings.faq || []), { q: "New Question?", a: "New Answer" }] })}
                className="gap-2"
              >
                <PlusCircle className="w-4 h-4" /> Add FAQ
              </Button>
            </div>
            
            <div className="space-y-6">
              {(settings.faq || []).map((f: any, i: number) => (
                <div key={i} className="flex gap-4 items-start border-l-4 border-primary pl-4 py-2">
                  <div className="flex-1 space-y-3">
                    <Input
                      placeholder="Question"
                      value={f.q}
                      onChange={(e) => {
                        const newFaq = [...settings.faq];
                        newFaq[i].q = e.target.value;
                        setSettings({ ...settings, faq: newFaq });
                      }}
                    />
                    <textarea
                      placeholder="Answer"
                      className="w-full flex min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      value={f.a}
                      onChange={(e) => {
                        const newFaq = [...settings.faq];
                        newFaq[i].a = e.target.value;
                        setSettings({ ...settings, faq: newFaq });
                      }}
                    />
                  </div>
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    onClick={() => {
                        const newFaq = settings.faq.filter((_: any, idx: number) => idx !== i);
                        setSettings({ ...settings, faq: newFaq });
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </section>

          {/* PRICING SETTINGS */}
          <section className="bg-card border border-border p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Pricing Plans</h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSettings({ ...settings, pricing: [...(settings.pricing || []), { title: "New Plan", price: "0", features: ["Feature 1"] }] })}
                className="gap-2"
              >
                <PlusCircle className="w-4 h-4" /> Add Plan
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {(settings.pricing || []).map((p: any, i: number) => (
                <div key={i} className="border border-border p-4 rounded-md space-y-4 relative bg-background">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-2 top-2 text-destructive hover:bg-destructive/10"
                    onClick={() => {
                        const newP = settings.pricing.filter((_: any, idx: number) => idx !== i);
                        setSettings({ ...settings, pricing: newP });
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  
                  <div>
                    <label className="block text-xs mb-1 text-muted-foreground">Title</label>
                    <Input
                      value={p.title}
                      onChange={(e) => {
                        const newP = [...settings.pricing];
                        newP[i].title = e.target.value;
                        setSettings({ ...settings, pricing: newP });
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 text-muted-foreground">Price</label>
                    <Input
                      value={p.price}
                      onChange={(e) => {
                        const newP = [...settings.pricing];
                        newP[i].price = e.target.value;
                        setSettings({ ...settings, pricing: newP });
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 text-muted-foreground">Features (comma separated)</label>
                    <textarea
                      className="w-full flex min-h-[60px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={p.features ? p.features.join(", ") : ""}
                      onChange={(e) => {
                        const newP = [...settings.pricing];
                        newP[i].features = e.target.value.split(",").map((s: string) => s.trim());
                        setSettings({ ...settings, pricing: newP });
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
