import tailwindcssAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        spydy: {
          red: "#a31515",
          redDark: "#7a0f0f",
          redBright: "#ef4444",
          redLight: "#fca5a5",
          black: "#111111",
        },
      },
      fontFamily: {
        comic: ["Bangers", "Impact", "cursive"],
        narrative: ["EB Garamond", "Georgia", "serif"],
        dialogue: ["Comic Neue", "Comic Sans MS", "cursive"],
        sans: ["Outfit", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin-slow 24s linear infinite",
        "breathe": "breathe 8s ease-in-out infinite",
      },
      keyframes: {
        "pulse-slow": {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "0.7" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "breathe": {
          "0%, 100%": { opacity: "0.5", transform: "translate(-50%, -50%) scale(1)" },
          "50%": { opacity: "0.85", transform: "translate(-50%, -50%) scale(1.1)" },
        },
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
