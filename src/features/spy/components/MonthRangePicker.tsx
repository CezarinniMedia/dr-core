import { useState, useMemo, useCallback } from "react";
import { Button } from "@/shared/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const MONTHS_PT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

interface MonthRangePickerProps {
  from: string | null; // "2025-11"
  to: string | null;   // "2025-12"
  onChange: (from: string | null, to: string | null) => void;
}

// --- Utilities ---

function toKey(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

function parseKey(key: string) {
  const [y, m] = key.split("-").map(Number);
  return { year: y, month: m - 1 };
}

/** Returns ALL months between from and to (inclusive) as "YYYY-MM" keys */
export function getSelectedMonths(from: string | null, to: string | null): string[] {
  if (!from) return [];
  const end = to || from;
  const f = parseKey(from);
  const t = parseKey(end);
  const months: string[] = [];
  let y = f.year;
  let m = f.month;
  while (y < t.year || (y === t.year && m <= t.month)) {
    months.push(toKey(y, m));
    m++;
    if (m > 11) { m = 0; y++; }
  }
  return months;
}

function formatLabel(from: string | null, to: string | null) {
  if (!from && !to) return "Selecionar periodo";
  if (from && !to) return `${MONTHS_PT[parseKey(from).month]} ${parseKey(from).year}`;
  if (from && to) {
    const f = parseKey(from);
    const t = parseKey(to);
    if (from === to) return `${MONTHS_PT[f.month]} ${f.year}`;
    const count = getSelectedMonths(from, to).length;
    return `${MONTHS_PT[f.month]} ${f.year} – ${MONTHS_PT[t.month]} ${t.year} (${count}m)`;
  }
  return "Selecionar periodo";
}

// --- Presets ---

type Preset = { label: string; shortLabel: string; getRange: (now: Date) => { from: string; to: string } };

const PRESETS: Preset[] = [
  {
    label: "Ultimo mes",
    shortLabel: "1M",
    getRange: (now) => {
      const end = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return { from: toKey(end.getFullYear(), end.getMonth()), to: toKey(end.getFullYear(), end.getMonth()) };
    },
  },
  {
    label: "Ultimos 3 meses",
    shortLabel: "3M",
    getRange: (now) => {
      const end = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const start = new Date(end.getFullYear(), end.getMonth() - 2, 1);
      return { from: toKey(start.getFullYear(), start.getMonth()), to: toKey(end.getFullYear(), end.getMonth()) };
    },
  },
  {
    label: "Ultimos 6 meses",
    shortLabel: "6M",
    getRange: (now) => {
      const end = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const start = new Date(end.getFullYear(), end.getMonth() - 5, 1);
      return { from: toKey(start.getFullYear(), start.getMonth()), to: toKey(end.getFullYear(), end.getMonth()) };
    },
  },
  {
    label: "Ano atual",
    shortLabel: "YTD",
    getRange: (now) => {
      const end = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return { from: toKey(now.getFullYear(), 0), to: toKey(end.getFullYear(), end.getMonth()) };
    },
  },
  {
    label: "Ultimo ano",
    shortLabel: "1A",
    getRange: (now) => {
      const end = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const start = new Date(end.getFullYear(), end.getMonth() - 11, 1);
      return { from: toKey(start.getFullYear(), start.getMonth()), to: toKey(end.getFullYear(), end.getMonth()) };
    },
  },
  {
    label: "Ultimos 2 anos",
    shortLabel: "2A",
    getRange: (now) => {
      const end = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const start = new Date(end.getFullYear(), end.getMonth() - 23, 1);
      return { from: toKey(start.getFullYear(), start.getMonth()), to: toKey(end.getFullYear(), end.getMonth()) };
    },
  },
];

// --- Component ---

export function MonthRangePicker({ from, to, onChange }: MonthRangePickerProps) {
  const now = useMemo(() => new Date(), []);
  const [baseYear, setBaseYear] = useState(now.getFullYear() - 1);
  const [selecting, setSelecting] = useState<"from" | "to" | null>(null);
  const [tempFrom, setTempFrom] = useState(from);
  const [tempTo, setTempTo] = useState(to);
  const [open, setOpen] = useState(false);

  const currentMonth = toKey(now.getFullYear(), now.getMonth());

  const getMonthState = useCallback((key: string) => {
    if (!tempFrom) return "none" as const;
    if (!tempTo) return key === tempFrom ? "single" as const : "none" as const;
    if (key === tempFrom && key === tempTo) return "single" as const;
    if (key === tempFrom) return "start" as const;
    if (key === tempTo) return "end" as const;
    if (key > tempFrom && key < tempTo) return "middle" as const;
    return "none" as const;
  }, [tempFrom, tempTo]);

  const isDisabled = (key: string) => key > currentMonth;

  const handleMonthClick = (key: string) => {
    if (isDisabled(key)) return;
    if (!tempFrom || selecting === "from") {
      setTempFrom(key);
      setTempTo(null);
      setSelecting("to");
    } else {
      if (key < tempFrom) {
        setTempTo(tempFrom);
        setTempFrom(key);
      } else {
        setTempTo(key);
      }
      setSelecting(null);
    }
  };

  const handlePreset = (preset: Preset) => {
    const r = preset.getRange(now);
    setTempFrom(r.from);
    setTempTo(r.to);
    setSelecting(null);
  };

  const handleApply = () => {
    onChange(tempFrom, tempTo || tempFrom);
    setOpen(false);
  };

  const handleReset = () => {
    setTempFrom(null);
    setTempTo(null);
    setSelecting(null);
    onChange(null, null);
    setOpen(false);
  };

  const handleOpen = (o: boolean) => {
    setOpen(o);
    if (o) {
      setTempFrom(from);
      setTempTo(to);
      setSelecting(null);
    }
  };

  const yearLeft = baseYear;
  const yearRight = baseYear + 1;

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-2 text-xs font-medium transition-all",
            from && to
              ? "border-[var(--accent-primary)]/40 text-[var(--text-body)] shadow-[0_0_8px_rgba(124,58,237,0.1)]"
              : "text-[var(--text-secondary)]"
          )}
        >
          <CalendarIcon className="h-3.5 w-3.5" />
          {formatLabel(from, to)}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 pointer-events-auto bg-[var(--bg-elevated)] border-[var(--border-default)]"
        align="start"
      >
        <div className="flex">
          {/* Month grids */}
          <div className="p-4">
            {/* Year navigation */}
            <div className="flex items-center justify-between mb-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-[var(--text-secondary)] hover:text-[var(--text-body)]"
                aria-label="Ano anterior"
                onClick={() => setBaseYear(baseYear - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex gap-12">
                <span className="text-sm font-semibold text-[var(--text-primary)] tabular-nums">{yearLeft}</span>
                <span className="text-sm font-semibold text-[var(--text-primary)] tabular-nums">{yearRight}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-[var(--text-secondary)] hover:text-[var(--text-body)]"
                aria-label="Proximo ano"
                onClick={() => setBaseYear(baseYear + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Months grid — two years side by side */}
            <div className="flex gap-6">
              {[yearLeft, yearRight].map((year) => (
                <div key={year} className="grid grid-cols-3 gap-1">
                  {MONTHS_PT.map((label, monthIndex) => {
                    const key = toKey(year, monthIndex);
                    const state = getMonthState(key);
                    const disabled = isDisabled(key);

                    return (
                      <button
                        key={key}
                        disabled={disabled}
                        onClick={() => handleMonthClick(key)}
                        className={cn(
                          "relative px-3 py-1.5 text-xs rounded-md transition-all duration-150 select-none",
                          "focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]/50",
                          // Disabled
                          disabled && "text-[var(--text-muted)]/30 cursor-not-allowed",
                          // Not selected, not disabled
                          state === "none" && !disabled && "text-[var(--text-body)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]",
                          // Single selected (or from=to)
                          state === "single" && "bg-[var(--accent-primary)] text-white font-medium shadow-[var(--glow-primary)]",
                          // Start of range
                          state === "start" && "bg-[var(--accent-primary)] text-white font-medium rounded-r-none",
                          // End of range
                          state === "end" && "bg-[var(--accent-primary)] text-white font-medium rounded-l-none",
                          // Middle of range
                          state === "middle" && "bg-[var(--accent-primary)]/20 text-[var(--accent-primary-light)] rounded-none",
                        )}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Selection hint */}
            <p className="text-[10px] text-[var(--text-muted)] mt-3 text-center">
              {selecting === "to"
                ? "Selecione o mes final do range"
                : tempFrom && tempTo
                  ? `${getSelectedMonths(tempFrom, tempTo).length} meses selecionados`
                  : "Clique para selecionar o periodo"}
            </p>
          </div>

          {/* Presets sidebar */}
          <div className="border-l border-[var(--border-default)] p-3 flex flex-col gap-1 min-w-[140px]">
            <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1 px-2">
              Presets
            </span>
            {PRESETS.map((p, idx) => {
              const isActive = (() => {
                if (!tempFrom || !tempTo) return false;
                const r = p.getRange(now);
                return r.from === tempFrom && r.to === tempTo;
              })();

              return (
                <button
                  key={p.label}
                  onClick={() => handlePreset(p)}
                  className={cn(
                    "text-xs text-left px-2 py-1.5 rounded-md transition-all duration-150",
                    "flex items-center justify-between gap-2",
                    isActive
                      ? "bg-[var(--accent-primary)]/15 text-[var(--accent-primary-light)] font-medium"
                      : "text-[var(--text-body)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
                  )}
                >
                  <span>{p.label}</span>
                  <span className={cn(
                    "text-[10px] font-mono tabular-nums",
                    isActive ? "text-[var(--accent-primary)]" : "text-[var(--text-muted)]"
                  )}>
                    {p.shortLabel}
                  </span>
                </button>
              );
            })}
            <div className="flex-1" />
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                className="text-xs flex-1 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-light)] text-white"
                onClick={handleApply}
                disabled={!tempFrom}
              >
                Aplicar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-[var(--text-secondary)]"
                onClick={handleReset}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
