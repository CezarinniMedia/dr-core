import { cn } from "@/shared/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface DataMetricCardProps {
  label: string;
  value: string | number;
  change?: number;
  changePeriod?: string;
  sparkline?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function DataMetricCard({
  label,
  value,
  change,
  changePeriod,
  sparkline,
  icon,
  className,
}: DataMetricCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isNeutral = change === undefined || change === 0;

  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--border-default)]",
        "bg-[var(--bg-surface)] p-[var(--space-card-padding)]",
        "transition-all duration-200",
        "hover:border-[var(--border-interactive)]",
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[length:var(--text-label)] text-[color:var(--text-secondary)] [font-weight:var(--font-regular)]">
          {label}
        </span>
        {icon && (
          <span className="text-[color:var(--text-muted)]">{icon}</span>
        )}
      </div>

      <div className="flex items-end justify-between gap-3">
        <div>
          <div
            className="text-[length:var(--text-page-title)] [font-weight:var(--font-bold)] text-[color:var(--text-primary)] leading-none"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {value}
          </div>

          {change !== undefined && (
            <div className="flex items-center gap-1 mt-1.5">
              {isPositive && (
                <TrendingUp className="w-3 h-3 text-[color:var(--semantic-success)]" />
              )}
              {isNegative && (
                <TrendingDown className="w-3 h-3 text-[color:var(--semantic-error)]" />
              )}
              {isNeutral && (
                <Minus className="w-3 h-3 text-[color:var(--text-muted)]" />
              )}
              <span
                className={cn(
                  "text-[length:var(--text-caption)] [font-weight:var(--font-medium)]",
                  isPositive && "text-[color:var(--semantic-success)]",
                  isNegative && "text-[color:var(--semantic-error)]",
                  isNeutral && "text-[color:var(--text-muted)]"
                )}
              >
                {isPositive ? "+" : ""}
                {change}%
              </span>
              {changePeriod && (
                <span className="text-[length:var(--text-caption)] text-[color:var(--text-muted)]">
                  {changePeriod}
                </span>
              )}
            </div>
          )}
        </div>

        {sparkline && (
          <div className="flex-shrink-0">{sparkline}</div>
        )}
      </div>
    </div>
  );
}
