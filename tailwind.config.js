/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: '#0a0a0a',
        'charcoal-2': '#141414',
        'charcoal-3': '#1c1c1c',
        cream: '#f5f0e6',
        'cream-2': '#e8e0d0',
        brass: '#c9a449',
        'brass-2': '#b8932f',
        'text-subtle': '#8a8278',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        brass: '0 0 0 1px rgba(201, 164, 73, 0.4), 0 4px 20px rgba(201, 164, 73, 0.15)',
      },
    },
  },
  plugins: [],
}
