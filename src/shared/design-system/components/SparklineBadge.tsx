import { cn } from "@/shared/lib/utils";
import { useMemo } from "react";

type SparklineTrend = "up" | "down" | "stable";

interface SparklineBadgeProps {
  data: number[];
  trend?: SparklineTrend;
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

const trendColors: Record<SparklineTrend, string> = {
  up: "var(--accent-green)",
  down: "var(--semantic-error)",
  stable: "var(--accent-teal)",
};

export function SparklineBadge({
  data,
  trend,
  width = 48,
  height = 20,
  color,
  className,
}: SparklineBadgeProps) {
  const computedTrend: SparklineTrend = trend ?? (() => {
    if (data.length < 2) return "stable";
    const last = data[data.length - 1];
    const prev = data[data.length - 2];
    if (last > prev) return "up";
    if (last < prev) return "down";
    return "stable";
  })();

  const strokeColor = color ?? trendColors[computedTrend];

  const { path, lastPoint } = useMemo(() => {
    if (!data.length) return { path: "", lastPoint: null };
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;
    const stepX = width / Math.max(data.length - 1, 1);

    let lp: { x: number; y: number } | null = null;

    const d = data
      .map((v, i) => {
        const x = i * stepX;
        const y = height - ((v - min) / range) * height;
        if (i === data.length - 1) lp = { x, y };
        return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");

    return { path: d, lastPoint: lp };
  }, [data, width, height]);

  if (!data.length) return null;

  const pathLength = data.length * 20;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      role="img"
    >
      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        style={{
          strokeDasharray: pathLength,
          strokeDashoffset: pathLength,
          animation: `sparkline-draw var(--duration-slow) var(--ease-out) forwards`,
        }}
      />
      {lastPoint && (
        <circle
          cx={(lastPoint as { x: number; y: number }).x}
          cy={(lastPoint as { x: number; y: number }).y}
          r={2.5}
          fill={strokeColor}
          style={{
            filter: `drop-shadow(0 0 4px ${strokeColor})`,
          }}
        />
      )}
    </svg>
  );
}
