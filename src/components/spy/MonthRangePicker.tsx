import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

interface MonthRangePickerProps {
  from: string | null; // "2025-11"
  to: string | null;   // "2025-12"
  onChange: (from: string | null, to: string | null) => void;
}

function toKey(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

function parseKey(key: string) {
  const [y, m] = key.split("-").map(Number);
  return { year: y, month: m - 1 };
}

function formatLabel(from: string | null, to: string | null) {
  if (!from && !to) return "Selecionar período";
  if (from && !to) return `${MONTHS[parseKey(from).month]} ${parseKey(from).year}`;
  if (from && to) {
    const f = parseKey(from);
    const t = parseKey(to);
    if (from === to) return `${MONTHS[f.month]} ${f.year}`;
    return `${MONTHS[f.month]} ${f.year} – ${MONTHS[t.month]} ${t.year}`;
  }
  return "Selecionar período";
}

export function MonthRangePicker({ from, to, onChange }: MonthRangePickerProps) {
  const now = new Date();
  const [baseYear, setBaseYear] = useState(now.getFullYear() - 1);
  const [selecting, setSelecting] = useState<"from" | "to" | null>(null);
  const [tempFrom, setTempFrom] = useState(from);
  const [tempTo, setTempTo] = useState(to);
  const [open, setOpen] = useState(false);

  const currentMonth = toKey(now.getFullYear(), now.getMonth());

  const isSelected = (key: string) => {
    if (!tempFrom) return false;
    if (!tempTo) return key === tempFrom;
    return key >= tempFrom && key <= tempTo;
  };

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

  const applyPreset = (months: number) => {
    const end = new Date(now.getFullYear(), now.getMonth() - 1, 1); // last complete month
    const start = new Date(end.getFullYear(), end.getMonth() - months + 1, 1);
    const f = toKey(start.getFullYear(), start.getMonth());
    const t = toKey(end.getFullYear(), end.getMonth());
    setTempFrom(f);
    setTempTo(t);
    setSelecting(null);
  };

  const applyCurrentYear = () => {
    const f = toKey(now.getFullYear(), 0);
    const t = toKey(now.getFullYear(), now.getMonth() - 1);
    setTempFrom(f);
    setTempTo(t);
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

  const yearLeft = baseYear;
  const yearRight = baseYear + 1;

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) { setTempFrom(from); setTempTo(to); setSelecting(null); } }}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 text-xs font-medium">
          <CalendarIcon className="h-3.5 w-3.5" />
          {formatLabel(from, to)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
        <div className="flex">
          {/* Month grids */}
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setBaseYear(baseYear - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex gap-8">
                <span className="text-sm font-semibold">{yearLeft}</span>
                <span className="text-sm font-semibold">{yearRight}</span>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setBaseYear(baseYear + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-6">
              {[yearLeft, yearRight].map((year) => (
                <div key={year} className="grid grid-cols-3 gap-1">
                  {MONTHS.map((m, i) => {
                    const key = toKey(year, i);
                    const selected = isSelected(key);
                    const disabled = isDisabled(key);
                    return (
                      <button
                        key={key}
                        disabled={disabled}
                        onClick={() => handleMonthClick(key)}
                        className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                          disabled
                            ? "text-muted-foreground/40 cursor-not-allowed"
                            : selected
                              ? "bg-primary text-primary-foreground font-medium"
                              : "hover:bg-accent text-foreground"
                        }`}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          {/* Presets */}
          <div className="border-l p-3 flex flex-col gap-1 min-w-[130px]">
            {[
              { label: "Último mês", fn: () => applyPreset(1) },
              { label: "Últimos 3 meses", fn: () => applyPreset(3) },
              { label: "Últimos 6 meses", fn: () => applyPreset(6) },
              { label: "Ano atual", fn: () => applyCurrentYear() },
              { label: "Último ano", fn: () => applyPreset(12) },
              { label: "Últimos 2 anos", fn: () => applyPreset(24) },
            ].map((p) => (
              <button
                key={p.label}
                onClick={p.fn}
                className="text-xs text-left px-2 py-1.5 rounded hover:bg-accent transition-colors text-foreground"
              >
                {p.label}
              </button>
            ))}
            <div className="flex-1" />
            <div className="flex gap-2 mt-2">
              <Button size="sm" className="text-xs flex-1" onClick={handleApply}>
                Aplicar
              </Button>
              <Button variant="ghost" size="sm" className="text-xs" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
