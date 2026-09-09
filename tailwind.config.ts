import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#05070E",
        foreground: "#F3F4F6",
        border: "rgba(255, 255, 255, 0.08)",
        surface: {
          DEFAULT: "#0B0F19",
          hover: "#111827",
          border: "rgba(255, 255, 255, 0.07)",
          highlight: "#1E293B",
        },
        nxt: {
          cyan: "#00F0FF",
          purple: "#7928CA",
          blue: "#0070F3",
          pink: "#FF0080",
          emerald: "#10B981",
          gold: "#F5A623",
        },
        brand: {
          cyan: "#00f0ff",
          green: "#00e599",
          amber: "#ffb800",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "-apple-system", "sans-serif"],
        sans: ["var(--font-sans)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        'squircle': '2.25rem',
      },
      boxShadow: {
        'neon-cyan': '0 0 25px -5px rgba(0, 240, 255, 0.4)',
        'neon-purple': '0 0 25px -5px rgba(121, 40, 202, 0.4)',
        'inner-light': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)',
      },
    },
  },
  plugins: [],
};

export default config;
