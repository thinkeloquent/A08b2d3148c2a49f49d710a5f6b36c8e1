/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Inter'", 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        chroma: {
          cyan: '#0ea5e9',
          violet: '#7c3aed',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#ef4444',
        },
      },
    },
  },
  plugins: [],
};
