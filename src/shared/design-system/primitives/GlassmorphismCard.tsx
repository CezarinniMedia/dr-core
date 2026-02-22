import { cn } from "@/shared/lib/utils";

interface GlassmorphismCardProps {
  children: React.ReactNode;
  className?: string;
  blur?: "sm" | "md" | "lg";
  glow?: "none" | "primary" | "amber" | "teal";
}

const blurMap = {
  sm: "backdrop-blur-sm",
  md: "backdrop-blur-md",
  lg: "backdrop-blur-lg",
};

const glowMap = {
  none: "",
  primary: "shadow-[0_24px_80px_rgba(0,0,0,0.5),0_0_120px_rgba(124,58,237,0.05)]",
  amber: "shadow-[0_24px_80px_rgba(0,0,0,0.5),0_0_120px_rgba(212,165,116,0.05)]",
  teal: "shadow-[0_24px_80px_rgba(0,0,0,0.5),0_0_120px_rgba(0,212,170,0.05)]",
};

export function GlassmorphismCard({
  children,
  className,
  blur = "md",
  glow = "none",
}: GlassmorphismCardProps) {
  return (
    <div
      className={cn(
        "bg-[rgba(20,20,20,0.8)] border border-white/[0.08] rounded-[var(--radius-lg)]",
        blurMap[blur],
        glowMap[glow],
        className
      )}
    >
      {children}
    </div>
  );
}
