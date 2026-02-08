import { useMemo, useRef, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import { formatNumber } from '@/lib/utils';

// 20-color palette for domains
const DOMAIN_COLORS = [
  'hsl(217, 91%, 60%)',  // primary blue
  'hsl(142, 76%, 46%)',  // green
  'hsl(24, 95%, 53%)',   // orange/accent
  'hsl(280, 67%, 55%)',  // purple
  'hsl(340, 82%, 52%)',  // pink
  'hsl(199, 89%, 48%)',  // cyan
  'hsl(38, 92%, 50%)',   // yellow
  'hsl(160, 60%, 45%)',  // teal
  'hsl(0, 84%, 60%)',    // red
  'hsl(250, 60%, 60%)',  // indigo
  'hsl(45, 93%, 47%)',   // amber
  'hsl(180, 60%, 45%)',  // dark cyan
  'hsl(300, 50%, 50%)',  // magenta
  'hsl(100, 50%, 45%)',  // lime
  'hsl(210, 70%, 50%)',  // medium blue
  'hsl(350, 70%, 55%)',  // rose
  'hsl(270, 50%, 50%)',  // violet
  'hsl(150, 50%, 40%)',  // emerald
  'hsl(30, 80%, 50%)',   // dark orange
  'hsl(190, 60%, 42%)',  // dark teal
];

export function getDomainColor(index: number): string {
  return DOMAIN_COLORS[index % DOMAIN_COLORS.length];
}

interface TrafficChartProps {
  data: Record<string, any>[];
  dominios: string[];
  hiddenDomains?: Set<string>;
  onToggleDomain?: (domain: string) => void;
  height?: number;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  const formatDate = (d: string) => {
    try {
      const date = new Date(d + 'T00:00:00');
      return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
    } catch { return d; }
  };

  return (
    <div className="rounded-lg border bg-popover p-3 shadow-lg text-popover-foreground">
      <p className="text-xs font-medium mb-2">{formatDate(label)}</p>
      {payload
        .filter((p: any) => p.value != null)
        .sort((a: any, b: any) => (b.value || 0) - (a.value || 0))
        .map((entry: any, i: number) => (
          <div key={i} className="flex items-center gap-2 text-xs py-0.5">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground truncate max-w-[140px]">{entry.dataKey}</span>
            <span className="font-semibold ml-auto">{formatNumber(entry.value)}</span>
          </div>
        ))}
    </div>
  );
}

function CustomLegend({ payload, onToggle, hidden }: any) {
  return (
    <div className="flex flex-wrap gap-2 px-2 py-1">
      {payload?.map((entry: any, i: number) => {
        const isHidden = hidden?.has(entry.value);
        return (
          <button
            key={i}
            onClick={() => onToggle?.(entry.value)}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs transition-opacity ${
              isHidden ? 'opacity-30' : 'opacity-100'
            } hover:opacity-80`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="truncate max-w-[120px]">{entry.value}</span>
          </button>
        );
      })}
    </div>
  );
}

export function TrafficChart({
  data, dominios, hiddenDomains, onToggleDomain, height = 350,
}: TrafficChartProps) {
  const chartRef = useRef<any>(null);

  const formatXAxis = useCallback((tick: string) => {
    try {
      const d = new Date(tick + 'T00:00:00');
      return d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
    } catch { return tick; }
  }, []);

  const visibleDomains = useMemo(
    () => dominios.filter(d => !hiddenDomains?.has(d)),
    [dominios, hiddenDomains]
  );

  if (!data.length) {
    return (
      <div className="flex items-center justify-center border border-dashed rounded-lg" style={{ height }}>
        <p className="text-sm text-muted-foreground">Sem dados de tráfego disponíveis</p>
      </div>
    );
  }

  return (
    <div ref={chartRef}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
          <XAxis
            dataKey="date"
            tickFormatter={formatXAxis}
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={{ stroke: 'hsl(var(--border))' }}
          />
          <YAxis
            tickFormatter={(v) => formatNumber(v)}
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={false}
            width={50}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            content={
              <CustomLegend onToggle={onToggleDomain} hidden={hiddenDomains} />
            }
          />
          {dominios.map((dom, i) => (
            <Line
              key={dom}
              type="monotone"
              dataKey={dom}
              stroke={getDomainColor(i)}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              hide={hiddenDomains?.has(dom)}
              connectNulls
              animationDuration={500}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
