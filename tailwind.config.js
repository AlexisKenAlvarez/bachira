

/** @type {import('tailwindcss').Config} */
module.exports = ({
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx,mdx}',
    './components/**/*.{ts,tsx,mdx}',
    './app/**/*.{ts,tsx,mdx}',
    './src/**/*.{ts,tsx,mdx}',
	],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      fontFamily: {
        primary: ['var(--font-geist-sans)'],
        secondary: ["var(--font-montserrat)"],
      },
      colors: {
        bggrey: '#F7F7F8',
        primary: '#2C7DB7',
        gchat: '#007cff'
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
});