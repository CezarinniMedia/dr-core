import { cn } from "@/shared/lib/utils";

type GlassOpacity = "solid" | "interactive" | "light";

interface GlassmorphismCardProps {
  children: React.ReactNode;
  blur?: number;
  opacity?: GlassOpacity;
  className?: string;
}

const opacityTokens: Record<GlassOpacity, string> = {
  solid: "var(--glass-solid)",
  interactive: "var(--glass-interactive)",
  light: "var(--overlay-light)",
};

export function GlassmorphismCard({
  children,
  className,
  blur = 8,
  opacity = "interactive",
}: GlassmorphismCardProps) {
  const style: React.CSSProperties = {
    background: opacityTokens[opacity],
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    border: "1px solid var(--border-glass)",
    borderRadius: "var(--radius-xl)",
  };

  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}
