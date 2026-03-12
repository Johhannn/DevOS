import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        desktop: "#0B0F19",
        panel: "#111827",
        window: "#1F2937",
        surface: "#374151",
        border: "#4B5563",
        accent: "#6366F1",
        accent2: "#06B6D4",
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
        text: "#F9FAFB",
        muted: "#9CA3AF",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "24px"
      },
      boxShadow: {
        window: "0 10px 30px -10px rgba(0, 0, 0, 0.5)",
        elevated: "0 4px 15px -5px rgba(0, 0, 0, 0.3)",
        glow: "0 0 15px -3px rgba(99, 102, 241, 0.4)"
      }
    },
  },
  plugins: [],
};

export default config;
