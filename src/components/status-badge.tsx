import { Badge } from "@/components/ui/badge";

type StatusType = "Active" | "Strike Off" | "Under Liquidation" | "Dormant" | "Amalgamated" | "Dissolved" | "Completed" | "Processing" | "Pending" | string;

const map: Record<string, string> = {
  Active: "bg-success/15 text-success border-success/30",
  Completed: "bg-success/15 text-success border-success/30",
  "Strike Off": "bg-destructive/15 text-destructive border-destructive/30",
   Dissolved: "bg-destructive/15 text-destructive border-destructive/30",
  "Under Liquidation": "bg-warning/20 text-warning-foreground border-warning/40",
  Processing: "bg-warning/20 text-warning-foreground border-warning/40",
  Pending: "bg-warning/20 text-warning-foreground border-warning/40",
  Dormant: "bg-muted text-muted-foreground border-border",
  Amalgamated: "bg-primary/10 text-primary border-primary/30",
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  const style = map[normalizedStatus] || map[status] || "bg-muted text-muted-foreground border-border";
  
  return (
    <Badge variant="outline" className={`${style} font-medium px-2.5 py-0.5 rounded-full`}>
      {label || status}
    </Badge>
  );
}
