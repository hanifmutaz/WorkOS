import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0e1a",
        surface: "#111827",
        border: "#1f2937",
        primary: "#38bdf8",
        muted: "#94a3b8",
      },
    },
  },
  plugins: [],
};

export default config;
