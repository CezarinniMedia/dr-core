import { useMemo } from "react";
import { cn } from "@/shared/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  getDay,
  subMonths,
  isSameDay,
} from "date-fns";
import { ptBR } from "date-fns/locale";

interface ActivityDay {
  date: string;
  count: number;
}

interface HeatmapCalendarProps {
  data: ActivityDay[];
  months?: number;
  className?: string;
}

const INTENSITY_COLORS = [
  "var(--bg-subtle)",
  "rgba(0, 212, 170, 0.2)",
  "rgba(0, 212, 170, 0.4)",
  "rgba(0, 212, 170, 0.6)",
  "rgba(0, 212, 170, 0.85)",
];

function getIntensityLevel(count: number, maxCount: number): number {
  if (count === 0) return 0;
  if (maxCount === 0) return 0;
  const ratio = count / maxCount;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

const WEEKDAY_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"];

export function HeatmapCalendar({ data, months = 3, className }: HeatmapCalendarProps) {
  const { monthsData, maxCount } = useMemo(() => {
    const activityMap = new Map<string, number>();
    let max = 0;
    for (const d of data) {
      activityMap.set(d.date, d.count);
      if (d.count > max) max = d.count;
    }

    const now = new Date();
    const result = [];

    for (let i = months - 1; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);
      const days = eachDayOfInterval({ start, end });

      const monthLabel = format(monthDate, "MMM yyyy", { locale: ptBR });
      const startDayOfWeek = getDay(start);

      const cells = days.map((day) => {
        const key = format(day, "yyyy-MM-dd");
        const count = activityMap.get(key) ?? 0;
        const isToday = isSameDay(day, now);
        return { date: day, key, count, isToday };
      });

      result.push({ monthLabel, startDayOfWeek, cells });
    }

    return { monthsData: result, maxCount: max };
  }, [data, months]);

  return (
    <TooltipProvider delayDuration={100}>
      <div className={cn("space-y-4", className)}>
        {/* Legend */}
        <div className="flex items-center justify-end gap-1.5">
          <span className="text-[length:var(--text-caption)] text-[color:var(--text-muted)] mr-1">
            Menos
          </span>
          {INTENSITY_COLORS.map((color, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: color }}
            />
          ))}
          <span className="text-[length:var(--text-caption)] text-[color:var(--text-muted)] ml-1">
            Mais
          </span>
        </div>

        {/* Months */}
        <div className="flex gap-4 overflow-x-auto">
          {monthsData.map((month) => (
            <div key={month.monthLabel} className="flex-shrink-0">
              <p className="text-[length:var(--text-caption)] text-[color:var(--text-secondary)] font-medium mb-2 capitalize">
                {month.monthLabel}
              </p>

              <div className="grid grid-rows-7 grid-flow-col gap-[3px]">
                {/* Leading empty cells to align weekdays */}
                {Array.from({ length: month.startDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="w-3.5 h-3.5" />
                ))}

                {month.cells.map((cell) => {
                  const level = getIntensityLevel(cell.count, maxCount);
                  return (
                    <Tooltip key={cell.key}>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "w-3.5 h-3.5 rounded-sm transition-colors",
                            cell.isToday && "ring-1 ring-[var(--accent-primary)]"
                          )}
                          style={{ backgroundColor: INTENSITY_COLORS[level] }}
                        />
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="glass-card text-[length:var(--text-caption)]"
                      >
                        <p className="text-[color:var(--text-body)]">
                          {format(cell.date, "dd MMM yyyy", { locale: ptBR })}
                        </p>
                        <p className="text-[color:var(--text-secondary)]">
                          {cell.count === 0 ? "Sem atividade" : `${cell.count} ${cell.count === 1 ? "acao" : "acoes"}`}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>

              {/* Weekday labels */}
              <div className="flex gap-[3px] mt-1">
                {WEEKDAY_LABELS.map((label, i) => (
                  <span
                    key={i}
                    className="w-3.5 text-center text-[9px] text-[color:var(--text-muted)]"
                  >
                    {i % 2 === 1 ? label : ""}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
