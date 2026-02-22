import { TrendingUp, TrendingDown, Zap, Ghost, type LucideIcon } from "lucide-react";
import { cn, formatNumber } from "@/shared/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SpikeAlert {
  spied_offer_id: string;
  offer_name: string;
  offer_status: string;
  domain: string;
  source: string;
  period_date: string;
  current_visits: number;
  prev_visits: number;
  change_percent: number;
  alert_type: string;
}

interface SpikeAlertCardProps {
  spike: SpikeAlert;
  onClick?: (offerId: string) => void;
}

const alertConfig: Record<string, { icon: LucideIcon; color: string; label: string }> = {
  spike: { icon: TrendingUp, color: "var(--semantic-spike)", label: "Spike" },
  drop: { icon: TrendingDown, color: "var(--semantic-error)", label: "Drop" },
  new_entry: { icon: Zap, color: "var(--accent-teal)", label: "Nova entrada" },
  resurrection: { icon: Ghost, color: "var(--accent-primary)", label: "Ressurreicao" },
};

export function SpikeAlertCard({ spike, onClick }: SpikeAlertCardProps) {
  const config = alertConfig[spike.alert_type] ?? alertConfig.spike;
  const Icon = config.icon;
  const isPositive = spike.change_percent > 0;

  return (
    <button
      aria-label={`Ver oferta ${spike.offer_name} — ${config.label} ${spike.change_percent > 0 ? "+" : ""}${spike.change_percent.toFixed(0)}%`}
      onClick={() => onClick?.(spike.spied_offer_id)}
      className={cn(
        "w-full text-left rounded-[var(--radius-lg)] border border-[var(--border-default)]",
        "bg-[var(--bg-surface)] p-3",
        "transition-all duration-200",
        "hover:border-[var(--border-interactive)]",
        spike.alert_type === "spike" && "animate-glow-pulse"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className="mt-0.5 rounded-md p-1.5"
          style={{ backgroundColor: `color-mix(in srgb, ${config.color} 15%, transparent)` }}
        >
          <Icon className="w-4 h-4" style={{ color: config.color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className="text-[length:var(--text-caption)] font-medium px-1.5 py-0.5 rounded"
              style={{
                color: config.color,
                backgroundColor: `color-mix(in srgb, ${config.color} 10%, transparent)`,
              }}
            >
              {config.label}
            </span>
            <span className="text-[length:var(--text-caption)] text-[color:var(--text-muted)]">
              {formatDistanceToNow(new Date(spike.period_date), { addSuffix: true, locale: ptBR })}
            </span>
          </div>

          <p className="text-[length:var(--text-body-size)] text-[color:var(--text-body)] font-medium truncate">
            {spike.offer_name}
          </p>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-[length:var(--text-caption)] text-[color:var(--text-muted)]">
              {spike.domain}
            </span>
            <span className="text-[length:var(--text-caption)] text-[color:var(--text-muted)]">
              {formatNumber(spike.prev_visits)} &rarr; {formatNumber(spike.current_visits)}
            </span>
            <span
              className="text-[length:var(--text-caption)] font-bold"
              style={{ color: isPositive ? "var(--semantic-spike)" : "var(--semantic-error)" }}
            >
              {isPositive ? "+" : ""}{spike.change_percent.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
