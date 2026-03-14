/**
 * TrafficChart — Feature Sagrada #1: Grafico Comparativo Multi-Dominio
 *
 * N dominios no mesmo grafico, cores unicas do design system,
 * hover tooltip glassmorphism, click toggle de series, area fill com gradient.
 * Recharts-based, respeita MonthRangePicker.
 */

import { useMemo, useState, useCallback } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { CHART_LINE_COLORS as CHART_COLORS } from "./traffic-intel/types";

const MONTH_NAMES_PT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export interface TrafficDataPoint {
  period_date: string;
  visits: number;
  domain: string;
}

interface TrafficChartProps {
  data: TrafficDataPoint[];
  domains?: string[];
  height?: number;
}

function formatDateLabel(date: string) {
  const parts = date.split("-");
  const m = parseInt(parts[1] || parts[0]);
  const y = parts[0];
  return `${MONTH_NAMES_PT[m - 1] || "?"} ${y.slice(2)}`;
}

function formatVisits(val: number) {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`;
  return String(val);
}

function formatVisitsFull(val: number) {
  return new Intl.NumberFormat("pt-BR").format(val);
}

// --- Custom Tooltip (glassmorphism style) ---

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;

  const dateStr = payload[0]?.payload?._date;
  if (!dateStr) return null;
  const parts = dateStr.split("-");
  const fullMonth = MONTH_NAMES_PT[parseInt(parts[1]) - 1];

  // Sort by value descending
  const sorted = [...payload]
    .filter((e: any) => e.value != null)
    .sort((a: any, b: any) => (b.value ?? 0) - (a.value ?? 0));

  return (
    <div
      className="rounded-lg p-3 text-xs shadow-2xl"
      style={{
        background: "rgba(20, 20, 20, 0.92)",
        backdropFilter: "blur(12px)",
        border: "1px solid var(--border-subtle, #2D2D2D)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
        minWidth: 180,
      }}
    >
      <p className="font-semibold mb-2" style={{ color: "var(--text-primary, #fff)" }}>
        {fullMonth} {parts[0]}
      </p>
      {sorted.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <span
            className="w-2.5 h-2.5 rounded-sm shrink-0"
            style={{
              backgroundColor: entry.color,
              boxShadow: `0 0 6px ${entry.color}40`,
            }}
          />
          <span className="truncate max-w-[120px]" style={{ color: "var(--text-secondary, #949494)" }}>
            {entry.dataKey}
          </span>
          <span className="ml-auto font-medium tabular-nums" style={{ color: "var(--text-primary, #fff)" }}>
            {formatVisitsFull(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

// --- Custom Legend with click toggle ---

function ChartLegend({
  domainList,
  hiddenDomains,
  onToggle,
}: {
  domainList: string[];
  hiddenDomains: Set<string>;
  onToggle: (domain: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-2">
      {domainList.map((domain, i) => {
        const color = CHART_COLORS[i % CHART_COLORS.length];
        const hidden = hiddenDomains.has(domain);
        return (
          <button
            key={domain}
            onClick={() => onToggle(domain)}
            className="flex items-center gap-1.5 px-1.5 py-0.5 rounded transition-all duration-150 hover:bg-[var(--bg-subtle)]"
            style={{ opacity: hidden ? 0.35 : 1 }}
          >
            <span
              className="w-3 h-1.5 rounded-sm shrink-0"
              style={{
                backgroundColor: color,
                boxShadow: hidden ? "none" : `0 0 6px ${color}30`,
              }}
            />
            <span
              className="text-[11px] truncate max-w-[140px]"
              style={{
                color: hidden ? "var(--text-muted, #6B7280)" : "var(--text-body, #F5F0EB)",
                textDecoration: hidden ? "line-through" : "none",
              }}
            >
              {domain}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// --- Main Chart Component ---

export function TrafficChart({ data, domains, height = 350 }: TrafficChartProps) {
  const [hiddenDomains, setHiddenDomains] = useState<Set<string>>(new Set());

  const toggleDomain = useCallback((domain: string) => {
    setHiddenDomains((prev) => {
      const next = new Set(prev);
      if (next.has(domain)) next.delete(domain);
      else next.add(domain);
      return next;
    });
  }, []);

  const { chartData, domainList } = useMemo(() => {
    const allDomains = domains || [...new Set(data.map((d) => d.domain))];
    const dateMap = new Map<string, Record<string, number>>();

    for (const point of data) {
      const key = point.period_date;
      if (!dateMap.has(key)) dateMap.set(key, {});
      dateMap.get(key)![point.domain] = point.visits;
    }

    const sorted = [...dateMap.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    const chartData = sorted.map(([date, values]) => ({
      _date: date, // raw date for tooltip
      label: formatDateLabel(date),
      ...values,
    }));

    return { chartData, domainList: allDomains };
  }, [data, domains]);

  if (chartData.length === 0) return null;

  return (
    <div>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
          <defs>
            {domainList.map((domain, i) => {
              const color = CHART_COLORS[i % CHART_COLORS.length];
              return (
                <linearGradient key={`grad-${domain}`} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              );
            })}
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border-default, #1F1F1F)"
            opacity={0.6}
            vertical={false}
          />

          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "var(--text-muted, #6B7280)" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />

          <YAxis
            tickFormatter={formatVisits}
            tick={{ fontSize: 11, fill: "var(--text-muted, #6B7280)" }}
            tickLine={false}
            axisLine={false}
            width={48}
          />

          <Tooltip
            content={<ChartTooltip />}
            cursor={{
              stroke: "var(--border-interactive, #3D3D3D)",
              strokeDasharray: "4 4",
            }}
          />

          {domainList.map((domain, i) => {
            const color = CHART_COLORS[i % CHART_COLORS.length];
            const hidden = hiddenDomains.has(domain);

            return (
              <Area
                key={domain}
                type="monotone"
                dataKey={domain}
                stroke={color}
                strokeWidth={hidden ? 0 : 2}
                fill={`url(#grad-${i})`}
                fillOpacity={hidden ? 0 : 1}
                dot={hidden ? false : { r: 3, fill: color, strokeWidth: 0 }}
                activeDot={hidden ? false : {
                  r: 5,
                  fill: color,
                  stroke: "var(--bg-surface, #141414)",
                  strokeWidth: 2,
                  style: { filter: `drop-shadow(0 0 4px ${color})` },
                }}
                hide={hidden}
                animationDuration={400}
                animationEasing="ease-out"
              />
            );
          })}
        </AreaChart>
      </ResponsiveContainer>

      {/* Clickable legend */}
      <ChartLegend
        domainList={domainList}
        hiddenDomains={hiddenDomains}
        onToggle={toggleDomain}
      />
    </div>
  );
}

// Mini sparkline for table rows (legacy export, used by SpyTrafficTab)
export function TrafficSparkline({ data, trending }: { data: number[]; trending?: string }) {
  if (!data || data.length < 2) return <span className="text-muted-foreground">—</span>;

  const last = data[data.length - 1];
  const prev = data[data.length - 2];
  const isUp = last >= prev;
  const color = isUp ? "var(--accent-teal, #00D4AA)" : "var(--semantic-error, #EF4444)";

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const h = 24;
  const w = 60;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");

  return (
    <svg width={w} height={h} className="inline-block">
      <polyline fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}
