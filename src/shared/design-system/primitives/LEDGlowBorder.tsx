import { cn } from "@/shared/lib/utils";

type GlowVariant = "primary" | "amber" | "teal" | "success" | "error";
type GlowPosition = "bottom" | "left" | "top" | "right";

interface LEDGlowBorderProps {
  children: React.ReactNode;
  variant?: GlowVariant;
  position?: GlowPosition;
  className?: string;
}

const glowStyles: Record<GlowVariant, Record<GlowPosition, string>> = {
  primary: {
    bottom: "border-b border-b-[var(--accent-primary)] shadow-[0_1px_8px_rgba(124,58,237,0.3)]",
    left: "border-l-2 border-l-[var(--accent-primary)] shadow-[-2px_0_12px_rgba(124,58,237,0.2)]",
    top: "border-t border-t-[var(--accent-primary)] shadow-[0_-1px_8px_rgba(124,58,237,0.2)]",
    right: "border-r-2 border-r-[var(--accent-primary)] shadow-[2px_0_12px_rgba(124,58,237,0.2)]",
  },
  amber: {
    bottom: "border-b border-b-[var(--accent-amber)] shadow-[0_1px_8px_rgba(212,165,116,0.3)]",
    left: "border-l-2 border-l-[var(--accent-amber)] shadow-[-2px_0_12px_rgba(212,165,116,0.2)]",
    top: "border-t border-t-[var(--accent-amber)] shadow-[0_-1px_8px_rgba(212,165,116,0.2)]",
    right: "border-r-2 border-r-[var(--accent-amber)] shadow-[2px_0_12px_rgba(212,165,116,0.2)]",
  },
  teal: {
    bottom: "border-b border-b-[var(--accent-teal)] shadow-[0_1px_8px_rgba(0,212,170,0.3)]",
    left: "border-l-2 border-l-[var(--accent-teal)] shadow-[-2px_0_12px_rgba(0,212,170,0.2)]",
    top: "border-t border-t-[var(--accent-teal)] shadow-[0_-1px_8px_rgba(0,212,170,0.2)]",
    right: "border-r-2 border-r-[var(--accent-teal)] shadow-[2px_0_12px_rgba(0,212,170,0.2)]",
  },
  success: {
    bottom: "border-b border-b-[var(--semantic-success)] shadow-[0_1px_8px_rgba(34,197,94,0.3)]",
    left: "border-l-2 border-l-[var(--semantic-success)] shadow-[-2px_0_12px_rgba(34,197,94,0.2)]",
    top: "border-t border-t-[var(--semantic-success)] shadow-[0_-1px_8px_rgba(34,197,94,0.2)]",
    right: "border-r-2 border-r-[var(--semantic-success)] shadow-[2px_0_12px_rgba(34,197,94,0.2)]",
  },
  error: {
    bottom: "border-b border-b-[var(--semantic-error)] shadow-[0_1px_8px_rgba(239,68,68,0.3)]",
    left: "border-l-2 border-l-[var(--semantic-error)] shadow-[-2px_0_12px_rgba(239,68,68,0.2)]",
    top: "border-t border-t-[var(--semantic-error)] shadow-[0_-1px_8px_rgba(239,68,68,0.2)]",
    right: "border-r-2 border-r-[var(--semantic-error)] shadow-[2px_0_12px_rgba(239,68,68,0.2)]",
  },
};

export function LEDGlowBorder({
  children,
  variant = "primary",
  position = "bottom",
  className,
}: LEDGlowBorderProps) {
  return (
    <div className={cn(glowStyles[variant][position], className)}>
      {children}
    </div>
  );
}
