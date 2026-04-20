import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "mcavault-theme";

export function applyInitialTheme() {
  if (typeof document === "undefined") return;
  document.documentElement.classList.remove("dark");
  localStorage.setItem(STORAGE_KEY, "light");
}

export function ThemeToggle() {
  return null; // Feature Disabled by user request
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    applyInitialTheme();
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-[var(--transition-smooth)] hover:bg-secondary hover:text-foreground"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
