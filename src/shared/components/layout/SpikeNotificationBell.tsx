import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { toast as sonnerToast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import {
  useSpikeNotifications,
  type NewSpikePayload,
} from "@/shared/hooks/useSpikeNotifications";
import { SpikeNotificationDropdown } from "./SpikeNotificationDropdown";
import { SpikeNotificationToast } from "./SpikeNotificationToast";

export function SpikeNotificationBell() {
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const listRef = useRef<HTMLDivElement>(null);

  const handleNavigateToOffer = useCallback(
    (offerId: string) => {
      navigate(`/spy/${offerId}`);
    },
    [navigate]
  );

  const handleNewSpike = useCallback(
    (spike: NewSpikePayload) => {
      sonnerToast.custom(
        (id) => (
          <SpikeNotificationToast
            offerName={spike.offer_name}
            domain={spike.domain}
            changePercent={spike.change_percent}
            visitsBefore={spike.previous_visits}
            visitsAfter={spike.current_visits}
            onViewOffer={() => {
              sonnerToast.dismiss(id);
              handleNavigateToOffer(spike.spied_offer_id);
            }}
            onDismiss={() => sonnerToast.dismiss(id)}
          />
        ),
        {
          duration: 8000,
          position: "bottom-right",
        }
      );
    },
    [handleNavigateToOffer]
  );

  const {
    unseenCount,
    spikes,
    isLoadingList,
    isOpen,
    setIsOpen,
    markAllAsSeen,
    isMarkingAsSeen,
  } = useSpikeNotifications({ onNewSpike: handleNewSpike });

  const hasSpikes = unseenCount > 0;
  const displayCount = unseenCount > 99 ? "99+" : String(unseenCount);
  const isIntenseGlow = unseenCount > 10;

  // Reset selection when dropdown opens/closes
  useEffect(() => {
    if (!isOpen) setSelectedIndex(-1);
  }, [isOpen]);

  // Keyboard shortcuts (e.code for macOS compat — Alt produces special chars with e.key)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Skip when typing in inputs/textareas
      const target = e.target as HTMLElement;
      const isEditable =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // Alt+S — toggle dropdown
      if (e.altKey && !e.shiftKey && e.code === "KeyS" && !isEditable) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }

      // Alt+Shift+S — mark all as seen
      if (e.altKey && e.shiftKey && e.code === "KeyS" && !isEditable) {
        e.preventDefault();
        markAllAsSeen();
        return;
      }

      if (!isOpen) return;

      // Escape — close dropdown
      if (e.key === "Escape") {
        e.preventDefault();
        setIsOpen(false);
        return;
      }

      // Arrow navigation inside dropdown
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < spikes.length - 1 ? prev + 1 : prev
        );
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        return;
      }

      // Enter — navigate to selected spike
      if (e.key === "Enter" && selectedIndex >= 0 && selectedIndex < spikes.length) {
        e.preventDefault();
        const spike = spikes[selectedIndex];
        setIsOpen(false);
        handleNavigateToOffer(spike.spied_offer_id);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, spikes, selectedIndex, setIsOpen, markAllAsSeen, handleNavigateToOffer]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex < 0 || !listRef.current) return;
    const items = listRef.current.querySelectorAll("[data-spike-item]");
    items[selectedIndex]?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative flex items-center justify-center w-9 h-9 rounded-lg cursor-pointer transition-colors hover:bg-[var(--bg-raised,#1E1E2E)] outline-none"
          aria-label={
            hasSpikes
              ? `${unseenCount} spikes nao vistos`
              : "Nenhum spike novo"
          }
        >
          <Bell
            size={18}
            className={
              hasSpikes
                ? "text-[var(--semantic-spike,#F97316)]"
                : "text-muted-foreground"
            }
          />

          {hasSpikes && (
            <span
              className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-[5px] rounded-full text-[11px] font-bold border-2 border-[var(--bg-base,#0A0A0A)] animate-glow-pulse"
              style={{
                background: "var(--semantic-spike, #F97316)",
                color: "var(--bg-base, #0A0A0A)",
                boxShadow: isIntenseGlow
                  ? "0 0 12px rgba(249, 115, 22, 0.6)"
                  : "0 0 8px rgba(249, 115, 22, 0.4)",
              }}
            >
              {displayCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[380px] max-h-[480px] overflow-y-auto p-0 border-[var(--border-subtle,#2D2D2D)] bg-[var(--bg-elevated,#1A1A1A)] rounded-xl"
        style={{
          boxShadow:
            "0 16px 48px rgba(0, 0, 0, 0.5), 0 0 32px rgba(249, 115, 22, 0.03)",
        }}
      >
        <SpikeNotificationDropdown
          ref={listRef}
          spikes={spikes}
          isLoading={isLoadingList}
          unseenCount={unseenCount}
          selectedIndex={selectedIndex}
          isMarkingAsSeen={isMarkingAsSeen}
          onMarkAllAsSeen={() => markAllAsSeen()}
          onSpikeClick={(spike) => {
            setIsOpen(false);
            handleNavigateToOffer(spike.spied_offer_id);
          }}
          onSeeAll={() => {
            setIsOpen(false);
            navigate("/spy?filter=spikes");
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
