import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: { DEFAULT: "#111113", hover: "#16161a", border: "#1e1e22" },
        gold: { DEFAULT: "#c9a96e", light: "#d4b87a", dark: "#a88854" },
        bg: "#0a0a0b",
        muted: "#888888",
        primary: "#f0f0f0",
      },
    },
  },
  plugins: [],
};
export default config;
