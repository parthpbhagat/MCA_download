import { useMemo, useState } from "react";
import { ShoppingCart, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePurchase } from "@/hooks/use-purchase";

const ORDER_OPTIONS = [
  { value: "v2", label: "V2 Documents", rate: 145 },
  { value: "v3", label: "V3 Documents", rate: 199 },
] as const;

const GST_RATE = 0.18;

const inr = (n: number) =>
  `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function BuyNowPanel({ companyName, cin }: { companyName: string; cin: string }) {
  const [orderFor, setOrderFor] = useState<(typeof ORDER_OPTIONS)[number]["value"]>("v2");
  const [quantity, setQuantity] = useState(1);
  const { purchased } = usePurchase(cin);

  const { rate, subTotal, gst, total } = useMemo(() => {
    const opt = ORDER_OPTIONS.find((o) => o.value === orderFor) ?? ORDER_OPTIONS[0];
    const sub = opt.rate * Math.max(1, quantity);
    const g = sub * GST_RATE;
    return { rate: opt.rate, subTotal: sub, gst: g, total: sub + g };
  }, [orderFor, quantity]);

  const handleBuy = () => {
    const opt = ORDER_OPTIONS.find((o) => o.value === orderFor)?.label || "V2 Documents";
    window.location.href = `/checkout/${cin}?name=${encodeURIComponent(companyName)}&type=${encodeURIComponent(opt)}`;
  };

  if (purchased) {
    return (
      <div className="mt-6 rounded-xl border border-success/30 bg-success/10 p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2 text-success">
          <CheckCircle2 className="h-5 w-5" />
          <div>
            <div className="text-sm font-semibold">Data unlocked for {companyName}</div>
            <div className="text-xs text-success/80">You have successfully purchased access to this company master data.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2">
        <ShoppingCart className="h-4 w-4 text-primary" />
        <h2 className="text-base font-semibold text-foreground">Order Documents</h2>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Purchase certified MCA filings for {companyName}.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <div className="grid grid-cols-3 items-center gap-3">
            <Label className="text-sm text-muted-foreground">Order For</Label>
            <div className="col-span-2">
              <Select value={orderFor} onValueChange={(v) => setOrderFor(v as typeof orderFor)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ORDER_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 items-center gap-3">
            <Label className="text-sm text-muted-foreground">Quantity</Label>
            <div className="col-span-2">
              <Input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 items-center gap-3">
            <Label className="text-sm text-muted-foreground">Rate</Label>
            <div className="col-span-2 text-sm font-medium text-foreground">{inr(rate)}</div>
          </div>
        </div>

        <div className="rounded-md border border-border bg-secondary/40 p-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Sub Total</span>
            <span className="font-medium text-foreground">{inr(subTotal)}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-muted-foreground">GST</span>
            <span className="font-medium text-foreground">18% ({inr(gst)})</span>
          </div>
          <div className="my-3 border-t border-border" />
          <div className="flex justify-between text-base">
            <span className="font-semibold text-foreground">Total</span>
            <span className="font-bold text-foreground">{inr(total)}</span>
          </div>
          <Button onClick={handleBuy} className="mt-4 w-full" size="lg">
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
}
