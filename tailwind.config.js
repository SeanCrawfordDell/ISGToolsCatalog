/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dell: {
          blue: '#0076CE',
          dark: '#1a1a1a',
          light: '#f5f5f5',
        }
      }
    },
  },
  plugins: [],
}