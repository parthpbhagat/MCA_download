import { useEffect, useState } from "react";

const STORAGE_KEY = "mcavault-purchases";

function readPurchases(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writePurchases(list: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("mcavault-purchases-changed"));
}

export function usePurchase(cin: string) {
  const [purchased, setPurchased] = useState(false);

  useEffect(() => {
    const sync = () => setPurchased(readPurchases().includes(cin));
    sync();
    window.addEventListener("mcavault-purchases-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("mcavault-purchases-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, [cin]);

  const purchase = () => {
    const list = readPurchases();
    if (!list.includes(cin)) writePurchases([...list, cin]);
  };

  return { purchased, purchase };
}
