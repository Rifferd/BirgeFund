/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#16A34A",
          dark: "#15803D",
        },
        accent: "#F59E0B",
        app: "#F7F8F3",
        text: "#0F172A",
        muted: "#64748B",
        border: "#E2E8F0",
        danger: "#EF4444",
        info: "#2563EB",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 20px 50px rgba(15, 23, 42, 0.06)",
      },
    },
  },
  plugins: [],
};