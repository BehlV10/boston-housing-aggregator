/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        boston: {
          brick: '#8B263E',
          navy: '#1D2A44',
          gold: '#C5A059',
          cream: '#F7F5F0',
        }
      }
    },
  },
  plugins: [],
}
