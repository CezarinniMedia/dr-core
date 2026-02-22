import { cn } from "@/shared/lib/utils";

type GlowVariant = "warm" | "primary" | "teal";

interface AmbientGlowProps {
  children: React.ReactNode;
  variant?: GlowVariant;
  className?: string;
}

const variantStyles: Record<GlowVariant, string> = {
  warm: "ambient-glow-warm",
  primary: "ambient-glow-primary",
  teal: "ambient-glow-teal",
};

export function AmbientGlow({
  children,
  variant = "warm",
  className,
}: AmbientGlowProps) {
  return (
    <div className={cn(variantStyles[variant], className)}>
      {children}
    </div>
  );
}
