import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { DashboardMetrics } from "../hooks/useDashboardMetrics";

interface StatusDistributionChartProps {
  metrics: DashboardMetrics;
}

const STATUS_CONFIG = [
  { key: "analyzing_offers", label: "Analyzing", color: "#3B82F6" },
  { key: "radar_offers", label: "Monitoring", color: "#D4A574" },
  { key: "hot_offers", label: "Hot", color: "#EF4444" },
  { key: "scaling_offers", label: "Scaling", color: "#22C55E" },
  { key: "cloned_offers", label: "Cloned", color: "#7C3AED" },
] as const;

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.[0]) return null;
  const { name, value } = payload[0];
  return (
    <div className="glass-card px-3 py-2">
      <p className="text-[length:var(--text-label)] text-[color:var(--text-body)]">
        <span className="font-medium">{name}:</span> {value}
      </p>
    </div>
  );
}

export function StatusDistributionChart({ metrics }: StatusDistributionChartProps) {
  const data = useMemo(() => {
    return STATUS_CONFIG
      .map((s) => ({
        name: s.label,
        value: metrics[s.key] ?? 0,
        color: s.color,
      }))
      .filter((d) => d.value > 0);
  }, [metrics]);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-[color:var(--text-muted)] text-[length:var(--text-label)]">
        Sem dados de status
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="w-[160px] h-[160px] flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={72}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-col gap-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-[length:var(--text-label)] text-[color:var(--text-secondary)]">
              {item.name}
            </span>
            <span
              className="text-[length:var(--text-label)] text-[color:var(--text-primary)] font-medium ml-auto"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
