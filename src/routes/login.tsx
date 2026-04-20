import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Building2, Loader2, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — MCAVault" },
      { name: "description", content: "Sign in to MCAVault to search MCA master company data, directors and filings." },
      { name: "robots", content: "noindex,nofollow" },
      { property: "og:title", content: "Sign In — MCAVault" },
      { property: "og:description", content: "Sign in to access MCA company and director data." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    setLoading(true);
    // Mock auth — replace with real NestJS call when backend is ready
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    const hasProfile = localStorage.getItem("profile_completed");
    if (hasProfile === "true") {
      toast.success("Signed in successfully", {
        description: "Welcome back to MCAVault.",
      });
      localStorage.setItem("is_logged_in", "true");
      navigate({ to: "/dashboard" });
    } else {
      toast.info("Please complete your profile to continue.", {
        description: "First time setup required.",
      });
      // Store temp email but DO NOT set is_logged_in yet!
      localStorage.setItem("temp_login_email", email);
      navigate({ to: "/profile" });
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center bg-secondary/40 px-4 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-xl border border-border bg-card p-8 shadow-[var(--shadow-elegant)]">
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-md bg-[image:var(--gradient-hero)] text-primary-foreground shadow-[var(--shadow-elegant)]">
                <Building2 className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Welcome back
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Sign in to your MCAVault account
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline"
                    onClick={() => toast.info("Password reset is not configured yet")}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/" className="font-medium text-primary hover:underline">
                Contact sales
              </Link>
            </p>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            This is a demo login (mock). Real authentication will connect to the
            NestJS backend.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
