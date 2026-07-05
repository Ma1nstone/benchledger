/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        graphite: {
          950: "#0B0D10",
          900: "#101318",
          800: "#161A21",
          700: "#1E232C",
          600: "#2A3039",
          500: "#3A4150",
        },
        trace: {
          400: "#3EF0B0",
          500: "#1DDBA3",
          600: "#12B98A",
        },
        signal: {
          amber: "#F2A93B",
          red: "#F0523E",
          green: "#3EF0B0",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        led: "0 0 8px 2px currentColor",
      },
      keyframes: {
        expand: {
          "0%": { gridTemplateRows: "0fr", opacity: "0" },
          "100%": { gridTemplateRows: "1fr", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
