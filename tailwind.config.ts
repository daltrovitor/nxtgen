import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0b10",
        foreground: "#f3f4f6",
        card: {
          DEFAULT: "rgba(18, 20, 29, 0.7)",
          foreground: "#f3f4f6",
          border: "rgba(255, 255, 255, 0.08)",
        },
        primary: {
          DEFAULT: "#6366f1", // Indigo / Electric violet
          foreground: "#ffffff",
          glow: "#4f46e5",
        },
        neon: {
          cyan: "#06b6d4",
          green: "#10b981",
          purple: "#a855f7",
          amber: "#f59e0b",
          rose: "#f43f5e",
        },
        surface: {
          DEFAULT: "#12141d",
          muted: "#181b26",
          border: "#242938",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(99, 102, 241, 0.4)",
        "glow-cyan": "0 0 25px -5px rgba(6, 182, 212, 0.4)",
        "glow-green": "0 0 25px -5px rgba(16, 185, 129, 0.4)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
