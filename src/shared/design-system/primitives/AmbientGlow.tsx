import { cn } from "@/shared/lib/utils";

type GlowColor = "primary" | "amber" | "teal" | "success" | "error" | "spike";
type GlowIntensity = "subtle" | "medium" | "strong";

interface AmbientGlowProps {
  children: React.ReactNode;
  color?: GlowColor;
  intensity?: GlowIntensity;
  className?: string;
}

const colorRgb: Record<GlowColor, string> = {
  primary: "124,58,237",
  amber: "212,165,116",
  teal: "0,212,170",
  success: "34,197,94",
  error: "239,68,68",
  spike: "249,115,22",
};

const intensityLevels: Record<GlowIntensity, { mid: number; far: number }> = {
  subtle: { mid: 0.06, far: 0.03 },
  medium: { mid: 0.08, far: 0.04 },
  strong: { mid: 0.12, far: 0.06 },
};

export function AmbientGlow({
  children,
  color = "primary",
  intensity = "medium",
  className,
}: AmbientGlowProps) {
  const rgb = colorRgb[color];
  const level = intensityLevels[intensity];

  const style: React.CSSProperties = {
    boxShadow: [
      `0 0 0 1px var(--border-default)`,
      `0 8px 32px rgba(${rgb},${level.mid})`,
      `0 0 64px rgba(${rgb},${level.far})`,
    ].join(", "),
  };

  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}
