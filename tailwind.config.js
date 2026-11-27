/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./projects/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        space: "#000000",
        surface: "#0f0f0f",
        line: { DEFAULT: "#2a2a2a", strong: "#3d3d3d" },
        primary: { DEFAULT: "#51cf43", light: "#7ee06f" },
        accent: { DEFAULT: "#4fa4ab", light: "#9fd9de" },
        soft: "#c3f8a6",
      },
      fontFamily: {
        display: ['"Patrick Hand"', "cursive"],
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out both",
      },
    },
  },
  plugins: [],
};

