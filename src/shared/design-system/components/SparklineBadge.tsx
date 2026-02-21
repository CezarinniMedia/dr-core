import { cn } from "@/shared/lib/utils";
import { useMemo } from "react";

interface SparklineBadgeProps {
  data: number[];
  width?: number;
  height?: number;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function SparklineBadge({
  data,
  width = 48,
  height = 20,
  trend,
  className,
}: SparklineBadgeProps) {
  const path = useMemo(() => {
    if (!data.length) return "";
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;
    const stepX = width / Math.max(data.length - 1, 1);

    return data
      .map((v, i) => {
        const x = i * stepX;
        const y = height - ((v - min) / range) * height;
        return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
  }, [data, width, height]);

  const computedTrend = trend ?? (() => {
    if (data.length < 2) return "neutral" as const;
    const last = data[data.length - 1];
    const prev = data[data.length - 2];
    if (last > prev) return "up" as const;
    if (last < prev) return "down" as const;
    return "neutral" as const;
  })();

  const strokeColor =
    computedTrend === "up"
      ? "var(--accent-teal)"
      : computedTrend === "down"
        ? "var(--semantic-error)"
        : "var(--text-muted)";

  if (!data.length) return null;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("flex-shrink-0", className)}
    >
      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
