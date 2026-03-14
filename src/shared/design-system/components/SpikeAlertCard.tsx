import { cn } from "@/shared/lib/utils";
import { AmbientGlow } from "../primitives/AmbientGlow";
import { LEDGlowBorder } from "../primitives/LEDGlowBorder";

interface SpikeAlertCardProps {
  offerName: string;
  domain: string;
  changePercent: number;
  visitsBefore?: number;
  visitsAfter?: number;
  detectedAt: string;
  onClick?: () => void;
  isNew?: boolean;
  className?: string;
}

function GlowDot({ active }: { active: boolean }) {
  return (
    <span
      className={cn("inline-block w-2 h-2 rounded-full flex-shrink-0")}
      style={{
        backgroundColor: "var(--semantic-spike)",
        boxShadow: active
          ? "0 0 8px var(--semantic-spike), 0 0 16px var(--semantic-spike-20)"
          : "0 0 4px var(--semantic-spike-20)",
        animation: active ? "glow-pulse var(--duration-glow-pulse) ease-in-out infinite" : "none",
      }}
    />
  );
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function SpikeAlertCard({
  offerName,
  domain,
  changePercent,
  visitsBefore,
  visitsAfter,
  detectedAt,
  onClick,
  isNew = false,
  className,
}: SpikeAlertCardProps) {
  const card = (
    <LEDGlowBorder
      variant="spike"
      position="left"
      intensity={isNew ? "strong" : "medium"}
      animated={isNew}
    >
      <div
        className={cn(
          "flex items-start gap-3 p-[var(--space-card-padding)]",
          "rounded-[var(--radius-lg)]",
          "transition-colors duration-200",
          onClick && "cursor-pointer hover:bg-[var(--bg-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:shadow-[var(--glow-primary)]",
          className
        )}
        style={{
          backgroundColor: "var(--semantic-spike-10)",
        }}
        onClick={onClick}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={onClick ? `Spike alert: ${offerName} +${changePercent}% on ${domain}` : undefined}
        onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } : undefined}
      >
        <GlowDot active={isNew} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span
              className="text-[length:var(--text-card-title)] [font-weight:var(--font-medium)] text-[color:var(--text-primary)] truncate"
            >
              {offerName}
            </span>
            <span
              className="text-[length:var(--text-caption)] text-[color:var(--text-muted)] flex-shrink-0"
            >
              {detectedAt}
            </span>
          </div>

          <div
            className="text-[length:var(--text-caption)] text-[color:var(--text-secondary)] truncate mt-0.5"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {domain}
          </div>

          <div className="flex items-center gap-3 mt-2">
            <span
              className="text-[length:var(--text-section-head)] [font-weight:var(--font-bold)]"
              style={{ color: "var(--semantic-spike)" }}
            >
              +{changePercent}%
            </span>

            {visitsBefore !== undefined && visitsAfter !== undefined && (
              <span className="text-[length:var(--text-caption)] text-[color:var(--text-muted)]">
                {formatNumber(visitsBefore)} → {formatNumber(visitsAfter)}
              </span>
            )}
          </div>
        </div>
      </div>
    </LEDGlowBorder>
  );

  if (isNew) {
    return (
      <AmbientGlow color="spike" intensity="subtle">
        {card}
      </AmbientGlow>
    );
  }

  return card;
}
