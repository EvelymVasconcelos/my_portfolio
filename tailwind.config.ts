import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // ─── Color Tokens (Samsung Design System via CSS Variables) ──────────
      colors: {
        background:         "var(--background)",
        surface:            "var(--surface)",
        "surface-elevated": "var(--surface-elevated)",
        border:             "var(--border)",
        "border-strong":    "var(--border-strong)",
        "text-primary":     "var(--text-primary)",
        "text-secondary":   "var(--text-secondary)",
        "text-muted":       "var(--text-muted)",
        "accent-primary":   "var(--accent-primary)",
        "accent-secondary": "var(--accent-secondary)",
        "accent-teal":      "var(--accent-teal)",
        "accent-success":   "var(--accent-success)",
        "accent-warning":   "var(--accent-warning)",
        "accent-danger":    "var(--accent-danger)",
        // Samsung palette — lilac variant
        samsung: {
          lilac:      "#6852D6",   // primary lilac
          "lilac-l":  "#9B7AE8",   // light lilac
          "lilac-d":  "#5740C0",   // dark lilac
          "lilac-p":  "#A98AEF",   // pastel lilac (dark mode)
          navy:       "#12172A",
          "navy-d":   "#0A0E1A",
        },
      },

      // ─── Typography — Roboto (Samsung font family) ────────────────────────
      fontFamily: {
        sans:    ["var(--font-roboto)", "Roboto", "system-ui", "sans-serif"],
        display: ["var(--font-roboto-slab)", "Roboto Slab", "Georgia", "serif"],
        mono:    ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      fontSize: {
        // Samsung product typography scale
        // — Samsung uses extra-bold/black headings, tight line-heights, and generous body spacing
        display: ["clamp(2.5rem, 5.5vw + 0.75rem, 4rem)",   { lineHeight: "1.05", fontWeight: "900", letterSpacing: "-0.01em" }],
        h1:      ["clamp(1.875rem, 3.5vw + 0.5rem, 2.75rem)",{ lineHeight: "1.10", fontWeight: "800", letterSpacing: "-0.01em" }],
        h2:      ["clamp(1.375rem, 2vw + 0.5rem, 1.875rem)", { lineHeight: "1.20", fontWeight: "700" }],
        h3:      ["clamp(1.125rem, 1.5vw + 0.25rem, 1.3125rem)", { lineHeight: "1.30", fontWeight: "700" }],
        "body-lg": ["1.125rem", { lineHeight: "1.75", fontWeight: "400" }],
        body:      ["1rem",     { lineHeight: "1.70", fontWeight: "400" }],
        caption:   ["0.875rem", { lineHeight: "1.55", fontWeight: "400" }],
        label:     ["0.6875rem",{ lineHeight: "1.4",  fontWeight: "600", letterSpacing: "0.08em" }],
      },

      // ─── Spacing Scale (8px grid) ─────────────────────────────────────────
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "26": "6.5rem",
        "30": "7.5rem",
      },

      // ─── Border Radius — Samsung: conservative, functional ────────────────
      borderRadius: {
        xs:  "4px",    // tags, table cells
        sm:  "8px",    // buttons, inputs
        md:  "12px",   // cards, panels
        lg:  "20px",   // modals, hero containers
        xl:  "28px",
        "2xl": "36px",
      },

      // ─── Box Shadow — Samsung: subtle depth, blue-tinted ─────────────────
      boxShadow: {
        // Light mode — lilac-tinted Samsung shadows
        "samsung-sm":  "0 1px 4px rgba(104, 82, 214, 0.08)",
        "samsung-md":  "0 2px 12px rgba(104, 82, 214, 0.10)",
        "samsung-lg":  "0 4px 24px rgba(104, 82, 214, 0.14)",
        "samsung-xl":  "0 8px 40px rgba(104, 82, 214, 0.18)",
        // Dark mode
        "dark-md":     "0 2px 12px rgba(0, 0, 0, 0.40)",
        "dark-lg":     "0 4px 32px rgba(0, 0, 0, 0.50)",
        // Glow — lilac accent
        "glow-lilac":  "0 0 28px rgba(104, 82, 214, 0.22)",
        // Generic aliases (component compat)
        glass:         "0 2px 12px rgba(104, 82, 214, 0.08)",
        "glass-light": "0 2px 12px rgba(104, 82, 214, 0.06)",
        "glow-primary": "0 0 28px rgba(104, 82, 214, 0.20)",
        "glow-secondary": "0 0 28px rgba(155, 122, 232, 0.22)",
        card:          "0 1px 4px rgba(104, 82, 214, 0.06), 0 4px 16px rgba(104, 82, 214, 0.08)",
      },

      // ─── Backdrop Blur ────────────────────────────────────────────────────
      backdropBlur: {
        xs: "4px",
      },

      // ─── Animations ───────────────────────────────────────────────────────
      keyframes: {
        "fade-in": {
          "0%":   { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          "0%":   { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%":   { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-left": {
          "0%":   { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "bounce-y": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-6px)" },
        },
        "draw-line": {
          "0%":   { strokeDashoffset: "1" },
          "100%": { strokeDashoffset: "0" },
        },
      },
      animation: {
        "fade-in":       "fade-in 0.4s ease-out forwards",
        "fade-in-up":    "fade-in-up 0.5s ease-out forwards",
        "slide-in-right":"slide-in-right 0.4s ease-out forwards",
        "slide-in-left": "slide-in-left 0.4s ease-out forwards",
        shimmer:         "shimmer 1.5s infinite",
        "bounce-slow":   "bounce-y 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
