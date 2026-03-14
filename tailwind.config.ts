import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    fontFamily: {
      sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      mono: ["JetBrains Mono", "Fira Code", "Consolas", "monospace"],
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
          muted: "hsl(var(--sidebar-muted))",
        },
        /* Vision Design System — Direct token access */
        vision: {
          void: "var(--bg-void)",
          base: "var(--bg-base)",
          deep: "var(--bg-deep)",
          surface: "var(--bg-surface)",
          elevated: "var(--bg-elevated)",
          raised: "var(--bg-raised)",
          subtle: "var(--bg-subtle)",
        },
        "accent-vision": {
          primary: "var(--accent-primary)",
          "primary-light": "var(--accent-primary-light)",
          "primary-soft": "var(--accent-primary-soft)",
          teal: "var(--accent-teal)",
          cyan: "var(--accent-cyan)",
          green: "var(--accent-green)",
          blue: "var(--accent-blue)",
          amber: "var(--accent-amber)",
          gold: "var(--accent-gold)",
          orange: "var(--accent-orange)",
        },
        semantic: {
          success: "var(--semantic-success)",
          warning: "var(--semantic-warning)",
          error: "var(--semantic-error)",
          danger: "var(--semantic-danger)",
          info: "var(--semantic-info)",
          spike: "var(--semantic-spike)",
          hot: "var(--semantic-hot)",
        },
        "text-vision": {
          primary: "var(--text-primary)",
          body: "var(--text-body)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        /* Vision radius tokens */
        "vision-sm": "var(--radius-sm)",
        "vision-md": "var(--radius-md)",
        "vision-lg": "var(--radius-lg)",
        "vision-xl": "var(--radius-xl)",
      },
      boxShadow: {
        /* Vision glow tokens — LED strip lighting */
        "glow-primary": "var(--glow-primary)",
        "glow-amber": "var(--glow-amber)",
        "glow-teal": "var(--glow-teal)",
        "glow-success": "var(--glow-success)",
        "glow-error": "var(--glow-error)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        /* Vision animation keyframes */
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 8px rgba(249, 115, 22, 0.3)" },
          "50%": { boxShadow: "0 0 20px rgba(249, 115, 22, 0.6)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-in-right": {
          from: { transform: "translateX(16px)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        /* Vision animations */
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        shimmer: "shimmer 1.5s linear infinite",
        "fade-in": "fade-in 150ms ease-out",
        "slide-in": "slide-in-right 200ms ease",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
