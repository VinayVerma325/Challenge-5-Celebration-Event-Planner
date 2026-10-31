/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf4f5',
          100: '#fbe8ea',
          200: '#f7d5d9',
          300: '#f0b3bb',
          400: '#e58593',
          500: '#d75a6c',
          600: '#c13a4f',
          700: '#a22b3e',
          800: '#872737',
          900: '#722532',
        }
      }
    },
  },
  plugins: [],
}
