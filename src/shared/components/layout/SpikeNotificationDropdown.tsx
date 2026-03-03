import { forwardRef } from "react";
import { Radar, Loader2 } from "lucide-react";
import type { SpikeNotification } from "@/shared/hooks/useSpikeNotifications";

function getRelativeTime(dateStr: string | null): string {
  if (!dateStr) return "";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "agora";
  if (diffMins < 60) return `ha ${diffMins}m`;
  if (diffHours < 24) return `ha ${diffHours}h`;
  return `ha ${diffDays}d`;
}

function formatVisits(n: number | null): string {
  if (n == null) return "—";
  return n.toLocaleString("pt-BR");
}

interface SpikeNotificationDropdownProps {
  spikes: SpikeNotification[];
  isLoading: boolean;
  unseenCount: number;
  selectedIndex: number;
  isMarkingAsSeen: boolean;
  onMarkAllAsSeen: () => void;
  onSpikeClick: (spike: SpikeNotification) => void;
  onSeeAll: () => void;
}

export const SpikeNotificationDropdown = forwardRef<
  HTMLDivElement,
  SpikeNotificationDropdownProps
>(function SpikeNotificationDropdown(
  {
    spikes,
    isLoading,
    unseenCount,
    selectedIndex,
    isMarkingAsSeen,
    onMarkAllAsSeen,
    onSpikeClick,
    onSeeAll,
  },
  ref
) {
  const newSpikes = spikes.filter((s) => s.seen_at === null);
  const earlierSpikes = spikes.filter((s) => s.seen_at !== null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={20} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div ref={ref}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid var(--border-default, #1F1F1F)" }}
      >
        <span
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "var(--text-muted, #6B7280)" }}
        >
          Spikes recentes
        </span>
        {unseenCount > 0 && (
          <button
            onClick={onMarkAllAsSeen}
            disabled={isMarkingAsSeen}
            className="text-[11px] text-primary hover:underline cursor-pointer disabled:opacity-50"
          >
            {isMarkingAsSeen ? "Marcando..." : "Mark all as seen"}
          </button>
        )}
      </div>

      {/* Empty state */}
      {spikes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 px-4 gap-2">
          <Radar size={32} className="text-muted-foreground" />
          <p
            className="text-sm text-center"
            style={{ color: "var(--text-muted, #6B7280)" }}
          >
            Nenhum spike nos ultimos 7 dias
          </p>
          <p
            className="text-xs text-center"
            style={{ color: "var(--text-muted, #6B7280)" }}
          >
            Continue monitorando o radar.
          </p>
        </div>
      )}

      {/* NEW section */}
      {newSpikes.length > 0 && (
        <>
          <div
            className="text-[11px] font-semibold uppercase px-4 py-2"
            style={{
              color: "var(--text-muted, #6B7280)",
              background: "var(--bg-surface, #141414)",
            }}
          >
            New
          </div>
          {newSpikes.map((spike, idx) => {
            const globalIdx = idx;
            return (
              <SpikeItem
                key={spike.id}
                spike={spike}
                isNew
                isSelected={selectedIndex === globalIdx}
                onClick={() => onSpikeClick(spike)}
              />
            );
          })}
        </>
      )}

      {/* EARLIER section */}
      {earlierSpikes.length > 0 && (
        <>
          <div
            className="text-[11px] font-semibold uppercase px-4 py-2"
            style={{
              color: "var(--text-muted, #6B7280)",
              background: "var(--bg-surface, #141414)",
              borderTop: "1px solid var(--border-default, #1F1F1F)",
            }}
          >
            Earlier
          </div>
          {earlierSpikes.map((spike, idx) => {
            const globalIdx = newSpikes.length + idx;
            return (
              <SpikeItem
                key={spike.id}
                spike={spike}
                isNew={false}
                isSelected={selectedIndex === globalIdx}
                onClick={() => onSpikeClick(spike)}
              />
            );
          })}
        </>
      )}

      {/* Footer */}
      {spikes.length > 0 && (
        <div
          className="px-4 py-3 text-center"
          style={{ borderTop: "1px solid var(--border-default, #1F1F1F)" }}
        >
          <button
            onClick={onSeeAll}
            className="text-sm text-primary hover:underline cursor-pointer"
          >
            See all spikes &rarr;
          </button>
        </div>
      )}
    </div>
  );
});

function SpikeItem({
  spike,
  isNew,
  isSelected,
  onClick,
}: {
  spike: SpikeNotification;
  isNew: boolean;
  isSelected: boolean;
  onClick: () => void;
}) {
  const changeStr =
    spike.change_percent != null
      ? `+${Math.round(spike.change_percent)}%`
      : "";

  return (
    <div
      data-spike-item
      onClick={onClick}
      className="flex gap-3 px-4 py-3 cursor-pointer transition-colors"
      style={{
        borderBottom: "1px solid var(--border-default, #1F1F1F)",
        background: isSelected
          ? "var(--bg-raised, #1E1E2E)"
          : "transparent",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "var(--bg-raised, #1E1E2E)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.background = isSelected
          ? "var(--bg-raised, #1E1E2E)"
          : "transparent")
      }
    >
      {/* Glow dot */}
      <div
        className="flex-shrink-0 mt-1.5 w-2 h-2 rounded-full"
        style={
          isNew
            ? {
                background: "var(--semantic-spike, #F97316)",
                boxShadow: "0 0 6px rgba(249, 115, 22, 0.5)",
                animation: "glow-pulse 2s ease-in-out infinite",
              }
            : {
                background: "var(--text-muted, #6B7280)",
              }
        }
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Row 1: Offer name */}
        <div
          className="text-sm truncate"
          style={{
            color: "var(--text-primary)",
            fontWeight: isNew ? 600 : 500,
          }}
        >
          {spike.offer_name}
        </div>

        {/* Row 2: Domain + % */}
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-xs font-mono truncate"
            style={{ color: "var(--text-secondary)" }}
          >
            {spike.domain}
          </span>
          {changeStr && (
            <span
              className="text-xs font-bold flex-shrink-0"
              style={{ color: "var(--semantic-spike, #F97316)" }}
            >
              {changeStr}
            </span>
          )}
        </div>

        {/* Row 3: Visits + timestamp */}
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-[11px]"
            style={{ color: "var(--text-muted, #6B7280)" }}
          >
            {formatVisits(spike.previous_visits)} &rarr;{" "}
            {formatVisits(spike.current_visits)}
          </span>
          <span
            className="text-[11px] flex-shrink-0"
            style={{ color: "var(--text-muted, #6B7280)" }}
          >
            {getRelativeTime(spike.created_at)}
          </span>
        </div>
      </div>
    </div>
  );
}
