import { cn } from "@/shared/lib/utils";
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
    colorClass: "text-[color:var(--accent-blue)] bg-[rgba(59,130,246,0.1)] border-[rgba(59,130,246,0.2)]",
    icon: Search,
  },
  monitoring: {
    label: "Monitoring",
    colorClass: "text-[color:var(--accent-amber)] bg-[rgba(212,165,116,0.1)] border-[rgba(212,165,116,0.2)]",
    icon: Eye,
  },
  hot: {
    label: "Hot",
    colorClass: "text-[color:var(--semantic-hot)] bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.2)]",
    icon: Flame,
  },
  scaling: {
    label: "Scaling",
    colorClass: "text-[color:var(--accent-green)] bg-[rgba(34,197,94,0.1)] border-[rgba(34,197,94,0.2)]",
    icon: TrendingUp,
  },
  cloned: {
    label: "Cloned",
    colorClass: "text-[color:var(--accent-primary)] bg-[rgba(124,58,237,0.1)] border-[rgba(124,58,237,0.2)]",
    icon: Copy,
  },
  dead: {
    label: "Dead",
    colorClass: "text-[color:var(--text-muted)] bg-[rgba(107,114,128,0.1)] border-[rgba(107,114,128,0.2)]",
    icon: Skull,
  },
  archived: {
    label: "Archived",
    colorClass: "text-[color:var(--text-muted)] bg-[rgba(107,114,128,0.1)] border-[rgba(107,114,128,0.2)]",
    icon: Archive,
  },
};

export function StatusBadge({ status, size = "sm", className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border [font-weight:var(--font-medium)]",
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
