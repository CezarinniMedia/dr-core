import { cn } from "@/shared/lib/utils";
import {
  Radar,
  Search,
  Flame,
  TrendingUp,
  Copy,
  TrendingDown,
  Skull,
  Archive,
  Ban,
  Trophy,
  Crosshair,
  FlaskConical,
  FileEdit,
} from "lucide-react";

type OfferStatus =
  | "radar"
  | "analyzing"
  | "hot"
  | "scaling"
  | "cloned"
  | "dying"
  | "dead"
  | "vault"
  | "never_scaled"
  | "winner"
  | "killed"
  | "testing"
  | "draft";

interface StatusBadgeProps {
  status: OfferStatus;
  size?: "sm" | "md";
  animated?: boolean;
  className?: string;
}

interface StatusConfig {
  label: string;
  icon: React.ElementType;
  textColor: string;
  bgColor: string;
  borderColor: string;
  canAnimate?: boolean;
}

const statusConfig: Record<OfferStatus, StatusConfig> = {
  radar: {
    label: "Radar",
    icon: Radar,
    textColor: "var(--text-secondary)",
    bgColor: "var(--text-muted-10)",
    borderColor: "var(--text-muted-20)",
  },
  analyzing: {
    label: "Analyzing",
    icon: Search,
    textColor: "var(--accent-blue)",
    bgColor: "var(--accent-blue-10)",
    borderColor: "var(--accent-blue-20)",
  },
  hot: {
    label: "Hot",
    icon: Flame,
    textColor: "var(--semantic-hot)",
    bgColor: "var(--semantic-error-10)",
    borderColor: "var(--semantic-error-20)",
    canAnimate: true,
  },
  scaling: {
    label: "Scaling",
    icon: TrendingUp,
    textColor: "var(--accent-green)",
    bgColor: "var(--accent-green-10)",
    borderColor: "var(--accent-green-20)",
  },
  cloned: {
    label: "Cloned",
    icon: Copy,
    textColor: "var(--accent-primary)",
    bgColor: "var(--accent-primary-10)",
    borderColor: "var(--accent-primary-20)",
  },
  dying: {
    label: "Dying",
    icon: TrendingDown,
    textColor: "var(--semantic-warning)",
    bgColor: "var(--semantic-warning-10)",
    borderColor: "var(--semantic-warning-20)",
  },
  dead: {
    label: "Dead",
    icon: Skull,
    textColor: "var(--text-muted)",
    bgColor: "var(--text-muted-10)",
    borderColor: "var(--text-muted-20)",
  },
  vault: {
    label: "Vault",
    icon: Archive,
    textColor: "var(--accent-amber)",
    bgColor: "var(--accent-amber-10)",
    borderColor: "var(--accent-amber-20)",
  },
  never_scaled: {
    label: "Never Scaled",
    icon: Ban,
    textColor: "var(--border-subtle)",
    bgColor: "var(--text-muted-10)",
    borderColor: "var(--text-muted-20)",
  },
  winner: {
    label: "Winner",
    icon: Trophy,
    textColor: "var(--accent-gold)",
    bgColor: "var(--accent-gold-20)",
    borderColor: "var(--accent-gold-20)",
    canAnimate: true,
  },
  killed: {
    label: "Killed",
    icon: Crosshair,
    textColor: "var(--semantic-error)",
    bgColor: "var(--semantic-error-10)",
    borderColor: "var(--semantic-error-20)",
  },
  testing: {
    label: "Testing",
    icon: FlaskConical,
    textColor: "var(--accent-primary)",
    bgColor: "var(--accent-primary-10)",
    borderColor: "var(--accent-primary-20)",
  },
  draft: {
    label: "Draft",
    icon: FileEdit,
    textColor: "var(--text-muted)",
    bgColor: "var(--text-muted-10)",
    borderColor: "var(--text-muted-20)",
  },
};

export function StatusBadge({
  status,
  size = "sm",
  animated = false,
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const shouldAnimate = animated && config.canAnimate;

  const style: React.CSSProperties = {
    color: config.textColor,
    backgroundColor: config.bgColor,
    borderColor: config.borderColor,
    ...(status === "killed" && { opacity: 0.65 }),
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border",
        "[font-weight:var(--font-medium)]",
        size === "sm" && "px-2 py-0.5 text-[11px]",
        size === "md" && "px-2.5 py-1 text-[12px]",
        shouldAnimate && "animate-glow-pulse",
        className
      )}
      style={style}
    >
      <Icon className={cn(size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5")} />
      {config.label}
    </span>
  );
}
