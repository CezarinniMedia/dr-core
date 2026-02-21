import { cn } from "@/lib/utils";
import {
  Search,
  Eye,
  Flame,
  TrendingUp,
  Copy,
  Skull,
  Archive,
} from "lucide-react";

type OfferStatus =
  | "analyzing"
  | "monitoring"
  | "hot"
  | "scaling"
  | "cloned"
  | "dead"
  | "archived";

interface StatusBadgeProps {
  status: OfferStatus;
  size?: "sm" | "md";
  className?: string;
}

const statusConfig: Record<
  OfferStatus,
  { label: string; colorClass: string; icon: React.ElementType }
> = {
  analyzing: {
    label: "Analyzing",
    colorClass: "text-[var(--accent-blue)] bg-[var(--accent-blue)]/10 border-[var(--accent-blue)]/20",
    icon: Search,
  },
  monitoring: {
    label: "Monitoring",
    colorClass: "text-[var(--accent-amber)] bg-[var(--accent-amber)]/10 border-[var(--accent-amber)]/20",
    icon: Eye,
  },
  hot: {
    label: "Hot",
    colorClass: "text-[var(--semantic-hot)] bg-[var(--semantic-hot)]/10 border-[var(--semantic-hot)]/20",
    icon: Flame,
  },
  scaling: {
    label: "Scaling",
    colorClass: "text-[var(--accent-green)] bg-[var(--accent-green)]/10 border-[var(--accent-green)]/20",
    icon: TrendingUp,
  },
  cloned: {
    label: "Cloned",
    colorClass: "text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/20",
    icon: Copy,
  },
  dead: {
    label: "Dead",
    colorClass: "text-[var(--text-muted)] bg-[var(--text-muted)]/10 border-[var(--text-muted)]/20",
    icon: Skull,
  },
  archived: {
    label: "Archived",
    colorClass: "text-[var(--text-muted)] bg-[var(--text-muted)]/10 border-[var(--text-muted)]/20",
    icon: Archive,
  },
};

export function StatusBadge({ status, size = "sm", className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-[var(--font-medium)]",
        size === "sm" && "px-2 py-0.5 text-[11px]",
        size === "md" && "px-2.5 py-1 text-[12px]",
        config.colorClass,
        className
      )}
    >
      <Icon className={cn(size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5")} />
      {config.label}
    </span>
  );
}
