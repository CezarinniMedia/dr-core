import { useMemo } from 'react';
import { useTrafficSparkline } from '@/hooks/useTrafficData';

interface TrafficMiniChartProps {
  dominio: string;
  width?: number;
  height?: number;
}

export function TrafficMiniChart({ dominio, width = 120, height = 40 }: TrafficMiniChartProps) {
  const { data: sparkData } = useTrafficSparkline(dominio);

  const pathAndColor = useMemo(() => {
    if (!sparkData || sparkData.length < 2) return null;

    const values = sparkData.map(d => d.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;

    const padding = 2;
    const w = width - padding * 2;
    const h = height - padding * 2;

    const points = values.map((v, i) => {
      const x = padding + (i / (values.length - 1)) * w;
      const y = padding + h - ((v - min) / range) * h;
      return `${x},${y}`;
    });

    const path = `M${points.join(' L')}`;
    const last = values[values.length - 1];
    const prev = values[values.length - 2];
    const trend = last > prev ? 'up' : last < prev ? 'down' : 'stable';

    return { path, trend, last, values };
  }, [sparkData, width, height]);

  if (!pathAndColor) {
    return (
      <div style={{ width, height }} className="flex items-center justify-center">
        <span className="text-[9px] text-muted-foreground">—</span>
      </div>
    );
  }

  const strokeColor = pathAndColor.trend === 'up'
    ? 'hsl(142, 76%, 46%)'
    : pathAndColor.trend === 'down'
    ? 'hsl(0, 84%, 60%)'
    : 'hsl(var(--muted-foreground))';

  return (
    <svg width={width} height={height} className="overflow-visible">
      <path
        d={pathAndColor.path}
        fill="none"
        stroke={strokeColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
