import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b0d12",
        panel: "#14171e",
        line: "#292e38",
        muted: "#8d94a3",
        gold: "#ffd447",
        emerald: "#4ed9a2"
      },
      boxShadow: {
        soft: "0 24px 80px rgba(0, 0, 0, 0.28)"
      }
    }
  },
  plugins: []
};

export default config;
