/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#16A34A",
          primaryDark: "#15803D",
          accent: "#F59E0B",
          background: "#F7F8F3",
          text: "#0F172A",
          muted: "#64748B",
          border: "#E2E8F0",
          danger: "#EF4444",
          info: "#2563EB"
        }
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem"
      },
      boxShadow: {
        soft: "0 20px 50px rgb(15 23 42 / 0.06)"
      }
    }
  },
  plugins: []
};
