/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'brand-red': '#E03A2F',
        'brand-red-dark': '#c42e24',
        'brand-blue': '#4A7FD4',
        'brand-blue-dark': '#3568bb',
        charcoal: '#0a0a0f',
        cream: '#f0f0f5',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}