import { cn } from "@/shared/lib/utils";
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";
import { SparklineBadge } from "./SparklineBadge";
import { useState } from "react";

interface DataMetricCardProps {
  value: string | number;
  label: string;
  change?: number;
  trend?: "up" | "down" | "stable";
  sparklineData?: number[];
  icon?: LucideIcon;
  glowOnHover?: boolean;
  className?: string;
}

export function DataMetricCard({
  value,
  label,
  change,
  trend,
  sparklineData,
  icon: Icon,
  glowOnHover = false,
  className,
}: DataMetricCardProps) {
  const [hovered, setHovered] = useState(false);

  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isNeutral = change === undefined || change === 0;

  const hoverGlowStyle: React.CSSProperties =
    glowOnHover && hovered
      ? {
          borderColor: "var(--accent-primary)",
          boxShadow: "0 1px 8px var(--accent-primary-10)",
        }
      : {};

  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--border-default)]",
        "bg-[var(--bg-surface)] p-[var(--space-card-padding)]",
        "transition-all duration-200",
        "hover:border-[var(--border-interactive)]",
        className
      )}
      style={hoverGlowStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[length:var(--text-label)] text-[color:var(--text-secondary)] [font-weight:var(--font-regular)]">
          {label}
        </span>
        {Icon && (
          <Icon className="w-4 h-4 text-[color:var(--text-muted)]" aria-hidden="true" />
        )}
      </div>

      <div className="flex items-end justify-between gap-3">
        <div>
          <div
            className="text-[length:var(--text-kpi)] [font-weight:var(--font-bold)] text-[color:var(--text-primary)] leading-none"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {value}
          </div>

          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {isPositive && (
                <TrendingUp className="w-3.5 h-3.5 text-[color:var(--accent-green)]" />
              )}
              {isNegative && (
                <TrendingDown className="w-3.5 h-3.5 text-[color:var(--semantic-error)]" />
              )}
              {isNeutral && (
                <Minus className="w-3.5 h-3.5 text-[color:var(--text-muted)]" />
              )}
              <span
                className={cn(
                  "text-[length:var(--text-label)] [font-weight:var(--font-medium)]",
                  isPositive && "text-[color:var(--accent-green)]",
                  isNegative && "text-[color:var(--semantic-error)]",
                  isNeutral && "text-[color:var(--text-muted)]"
                )}
              >
                {isPositive ? "+" : ""}
                {change}%
              </span>
            </div>
          )}
        </div>

        {sparklineData && sparklineData.length > 0 && (
          <div className="flex-shrink-0">
            <SparklineBadge data={sparklineData} trend={trend} />
          </div>
        )}
      </div>
    </div>
  );
}
