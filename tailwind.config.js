/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#00563B",
        secondary: "#2F7D6B",
        background: "#F6E6E8",
        accent1: "#D9D4CC",
        accent2: "#B76E79",
        vibrantPrimary: "#00563B",
        vibrantSecondary: "#B76E79",
        vibrantBlue: "#3E7C6D",
        vibrantPurple: "#C9A0A8",
        textPrimary: "#1A1A1A",
        textSecondary: "#2F2F2F",
      },
      fontFamily: {
        sans: ['Roboto', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
