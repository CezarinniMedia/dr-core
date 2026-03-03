import { cn } from "@/shared/lib/utils";

type GlowVariant = "primary" | "amber" | "teal" | "success" | "error" | "spike";
type GlowIntensity = "subtle" | "medium" | "strong";
type GlowPosition = "left" | "bottom" | "top" | "right";

interface LEDGlowBorderProps {
  children: React.ReactNode;
  variant?: GlowVariant;
  intensity?: GlowIntensity;
  animated?: boolean;
  position?: GlowPosition;
  className?: string;
}

const colorMap: Record<GlowVariant, { border: string; rgb: string }> = {
  primary: { border: "var(--accent-primary)", rgb: "124,58,237" },
  amber: { border: "var(--accent-amber)", rgb: "212,165,116" },
  teal: { border: "var(--accent-teal)", rgb: "0,212,170" },
  success: { border: "var(--semantic-success)", rgb: "34,197,94" },
  error: { border: "var(--semantic-error)", rgb: "239,68,68" },
  spike: { border: "var(--semantic-spike)", rgb: "249,115,22" },
};

const intensityOpacity: Record<GlowIntensity, { shadow: number; spread: number }> = {
  subtle: { shadow: 0.1, spread: 8 },
  medium: { shadow: 0.2, spread: 12 },
  strong: { shadow: 0.3, spread: 20 },
};

const positionStyles: Record<GlowPosition, (border: string, rgb: string, intensity: GlowIntensity) => React.CSSProperties> = {
  bottom: (border, rgb, intensity) => ({
    borderBottom: `1px solid ${border}`,
    boxShadow: `0 1px ${intensityOpacity[intensity].spread}px rgba(${rgb},${intensityOpacity[intensity].shadow})`,
  }),
  top: (border, rgb, intensity) => ({
    borderTop: `1px solid ${border}`,
    boxShadow: `0 -1px ${intensityOpacity[intensity].spread}px rgba(${rgb},${intensityOpacity[intensity].shadow})`,
  }),
  left: (border, rgb, intensity) => ({
    borderLeft: `2px solid ${border}`,
    boxShadow: `-2px 0 ${intensityOpacity[intensity].spread}px rgba(${rgb},${intensityOpacity[intensity].shadow})`,
  }),
  right: (border, rgb, intensity) => ({
    borderRight: `2px solid ${border}`,
    boxShadow: `2px 0 ${intensityOpacity[intensity].spread}px rgba(${rgb},${intensityOpacity[intensity].shadow})`,
  }),
};

export function LEDGlowBorder({
  children,
  variant = "primary",
  intensity = "subtle",
  animated = false,
  position = "bottom",
  className,
}: LEDGlowBorderProps) {
  const { border, rgb } = colorMap[variant];
  const style = positionStyles[position](border, rgb, intensity);

  return (
    <div
      className={cn(animated && "animate-glow-pulse", className)}
      style={style}
    >
      {children}
    </div>
  );
}
