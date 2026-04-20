import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Building2, Search, ShoppingBag, User, LogOut, LogIn, MapPin, Phone, Mail, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(localStorage.getItem("is_logged_in") === "true");
    };
    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("is_logged_in");
    setIsLoggedIn(false);
    navigate({ to: "/login" });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="text-xl font-medium tracking-tight text-[#1d69d7]">
            MCA Download
          </div>
        </Link>

        {isLoggedIn ? (
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              to="/dashboard"
              activeProps={{ className: "text-primary" }}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Company
            </Link>
            <Link
              to="/orders"
              activeProps={{ className: "text-primary" }}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Orders
            </Link>
            <Link
              to="/profile"
              activeProps={{ className: "text-primary" }}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-destructive outline-none border-none bg-transparent cursor-pointer"
            >
              Log Out
            </button>
          </nav>
        ) : (
          <nav className="hidden items-center gap-10 md:flex">
            <Link
              to="/"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Home
            </Link>
            <Link
              to="/pricing"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Pricing
            </Link>
            <a
              href="/#faq"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              FAQ
            </a>
            <Link
              to="/login"
              className="rounded-md bg-[#3182ce] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#2b6cb0] hover:shadow-md"
            >
              Get Started
            </Link>
          </nav>
        )}

        <div className="flex items-center gap-4">
          {/* Update Token button removed as requested */}
          
          <button 
            className="md:hidden p-2 text-muted-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          <ThemeToggle />
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 flex flex-col gap-4">
          <Link to="/" className="text-sm font-medium hover:text-primary py-2" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link to="/pricing" className="text-sm font-medium hover:text-primary py-2" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
          <a href="/#faq" className="text-sm font-medium hover:text-primary py-2" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
          
          {isLoggedIn ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium hover:text-primary py-2" onClick={() => setMobileMenuOpen(false)}>Company</Link>
              <Link to="/orders" className="text-sm font-medium hover:text-primary py-2" onClick={() => setMobileMenuOpen(false)}>Orders</Link>
              <Link to="/profile" className="text-sm font-medium hover:text-primary py-2" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
              <button onClick={() => { setMobileMenuOpen(false); handleLogout(); }} className="text-left text-sm font-medium text-destructive py-2">Log Out</button>
            </>
          ) : (
            <Link to="/login" className="text-sm font-medium hover:text-primary py-2" onClick={() => setMobileMenuOpen(false)}>Login</Link>
          )}
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  const [footerText, setFooterText] = useState("");
  const [contactInfo, setContactInfo] = useState({
    name: "Technowire DataScience Pvt. Ltd.",
    address: "Eighteen Floor, 1815, Block-B,\nNavratna Corporate Park,\nOpp. Jayantilal Park, Bopal Road,\nAmbli, Gujarat, PIN: 380058, India",
    phone: "+91 9624850607",
    email: "technowire@outlook.com"
  });

  useEffect(() => {
    fetch("http://localhost:8000/api/settings")
      .then(r => r.json())
      .then(d => {
        if (d && d.footerText) setFooterText(d.footerText);
        if (d && d.contactInfo) setContactInfo(d.contactInfo);
      })
      .catch(e => console.error(e));
  }, []);

  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="mb-2 text-sm font-semibold text-foreground">MCAVault</div>
            <p className="text-xs text-muted-foreground">
              India's most comprehensive MCA master data search platform.
              25L+ companies, 41L+ directors.
            </p>
          </div>
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Product
            </div>
            <ul className="space-y-1 text-sm text-foreground/80">
              <li><Link to="/search" className="hover:text-primary">Company Search</Link></li>
              <li><Link to="/directors" className="hover:text-primary">Director Lookup</Link></li>
              <li><Link to="/pricing" className="hover:text-primary">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Legal
            </div>
            <ul className="space-y-1 text-sm text-foreground/80">
              <li>Terms of Service</li>
              <li>Privacy Policy</li>
              <li>Disclaimer</li>
            </ul>
          </div>
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Contact
            </div>
            <address className="space-y-2 text-xs not-italic text-foreground/80">
              <div className="font-semibold text-foreground">
                {contactInfo.name}
              </div>
              <div className="flex gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="text-muted-foreground whitespace-pre-wrap">
                  {contactInfo.address}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <a href={`tel:${contactInfo.phone}`} className="hover:text-primary">
                  {contactInfo.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <a href={`mailto:${contactInfo.email}`} className="hover:text-primary">
                  {contactInfo.email}
                </a>
              </div>
            </address>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <div>
            {footerText ? footerText : `© ${new Date().getFullYear()} Technowire DataScience Pvt. Ltd. All Rights Reserved.`}
          </div>
          <div className="flex items-center gap-4">
             <Link to="/about" className="hover:text-primary transition-colors">About Us</Link>
             <span className="opacity-30">|</span>
             <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
             <span className="opacity-30">|</span>
             <Link to="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link>
          </div>
        </div>
        <div className="mt-4 text-center text-[10px] text-muted-foreground opacity-60">
          Data sourced from public MCA21 records. Not affiliated with the Ministry of Corporate Affairs, Government of India.
        </div>
      </div>
    </footer>
  );
}
