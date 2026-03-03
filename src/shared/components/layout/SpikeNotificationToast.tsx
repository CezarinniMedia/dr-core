import { X, Zap } from "lucide-react";

function formatVisits(n: number | null): string {
  if (n == null) return "—";
  return n.toLocaleString("pt-BR");
}

interface SpikeNotificationToastProps {
  offerName: string;
  domain: string;
  changePercent: number | null;
  visitsBefore: number | null;
  visitsAfter: number | null;
  onViewOffer: () => void;
  onDismiss: () => void;
}

export function SpikeNotificationToast({
  offerName,
  domain,
  changePercent,
  visitsBefore,
  visitsAfter,
  onViewOffer,
  onDismiss,
}: SpikeNotificationToastProps) {
  const changeStr =
    changePercent != null ? `+${Math.round(changePercent)}%` : "";

  return (
    <div
      className="relative rounded-xl p-4"
      style={{
        width: 360,
        background: "var(--bg-elevated, #1A1A1A)",
        border: "1px solid var(--semantic-spike, #F97316)",
        borderLeft: "4px solid var(--semantic-spike, #F97316)",
        boxShadow:
          "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 24px rgba(249, 115, 22, 0.08)",
        animation: "glow-pulse 2s ease-in-out 1",
      }}
    >
      {/* Close button */}
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 p-0.5 cursor-pointer transition-colors"
        style={{ color: "var(--text-muted, #6B7280)" }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.color = "var(--text-primary)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.color = "var(--text-muted, #6B7280)")
        }
        aria-label="Fechar notificacao"
      >
        <X size={14} />
      </button>

      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Zap size={16} style={{ color: "var(--semantic-spike, #F97316)" }} />
        <span
          className="text-sm font-semibold"
          style={{ color: "var(--semantic-spike, #F97316)" }}
        >
          Spike detectado!
        </span>
      </div>

      {/* Offer name */}
      <div
        className="text-sm font-medium mb-1"
        style={{ color: "var(--text-primary)" }}
      >
        {offerName}
      </div>

      {/* Domain + % */}
      <div className="flex items-center justify-between gap-2 mb-0.5">
        <span
          className="text-xs font-mono"
          style={{ color: "var(--text-secondary)" }}
        >
          {domain}
        </span>
        {changeStr && (
          <span
            className="text-xs font-bold"
            style={{ color: "var(--semantic-spike, #F97316)" }}
          >
            {changeStr}
          </span>
        )}
      </div>

      {/* Visits */}
      <div
        className="text-[11px]"
        style={{ color: "var(--text-muted, #6B7280)" }}
      >
        {formatVisits(visitsBefore)} &rarr; {formatVisits(visitsAfter)} visits
      </div>

      {/* Footer CTA */}
      <div className="mt-2 text-right">
        <button
          onClick={onViewOffer}
          className="text-xs text-primary hover:underline cursor-pointer"
        >
          Ver Oferta &rarr;
        </button>
      </div>
    </div>
  );
}
