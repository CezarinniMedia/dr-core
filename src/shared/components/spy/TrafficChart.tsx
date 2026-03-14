import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const LINE_COLORS = [
  "hsl(217, 91%, 60%)", // primary blue
  "hsl(0, 84%, 60%)",   // red
  "hsl(142, 76%, 36%)", // green
  "hsl(38, 92%, 50%)",  // amber
  "hsl(262, 83%, 58%)", // purple
  "hsl(330, 81%, 60%)", // pink
  "hsl(199, 89%, 48%)", // cyan
  "hsl(24, 95%, 53%)",  // orange
];

const MONTH_NAMES_PT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

interface TrafficDataPoint {
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
  const [y, m] = date.split("-");
  return `${MONTH_NAMES_PT[parseInt(m) - 1]} ${y.slice(2)}`;
}

function formatVisits(val: number) {
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
  return String(val);
}

function formatVisitsFull(val: number) {
  return new Intl.NumberFormat("pt-BR").format(val);
}

export function TrafficChart({ data, domains, height = 300 }: TrafficChartProps) {
  const { chartData, domainList } = useMemo(() => {
    const allDomains = domains || [...new Set(data.map((d) => d.domain))];
    const dateMap = new Map<string, Record<string, number>>();

    for (const point of data) {
      if (!dateMap.has(point.period_date)) dateMap.set(point.period_date, {});
      dateMap.get(point.period_date)![point.domain] = point.visits;
    }

    const sorted = [...dateMap.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    const chartData = sorted.map(([date, values]) => ({
      date,
      label: formatDateLabel(date),
      ...values,
    }));

    return { chartData, domainList: allDomains };
  }, [data, domains]);

  if (chartData.length === 0) return null;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    // Get full date from first payload
    const dateStr = payload[0]?.payload?.date;
    const [y, m] = (dateStr || "").split("-");
    const fullMonth = MONTH_NAMES_PT[parseInt(m) - 1];
    return (
      <div className="rounded-lg border bg-popover p-2.5 text-xs shadow-xl">
        <p className="font-medium mb-1.5">{fullMonth} {y}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.dataKey}:</span>
            <span className="font-medium">{formatVisitsFull(entry.value)} visitas</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tickFormatter={formatVisits}
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          tickLine={false}
          axisLine={false}
          width={45}
        />
        <Tooltip content={<CustomTooltip />} />
        {domainList.map((domain, i) => (
          <Line
            key={domain}
            type="monotone"
            dataKey={domain}
            stroke={LINE_COLORS[i % LINE_COLORS.length]}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

// Mini sparkline for table rows
export function TrafficSparkline({ data, trending }: { data: number[]; trending?: string }) {
  if (!data || data.length < 2) return <span className="text-muted-foreground">—</span>;

  const last = data[data.length - 1];
  const prev = data[data.length - 2];
  const isUp = last >= prev;
  const color = isUp ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)";

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const h = 24;
  const w = 60;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");

  return (
    <svg width={w} height={h} className="inline-block">
      <polyline fill="none" stroke={color} strokeWidth={1.5} points={points} />
    </svg>
  );
}
