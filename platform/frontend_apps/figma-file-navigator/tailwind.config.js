/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../frontend-components/page-menu-offcanvas-template-layout/src/**/*.{js,ts,jsx,tsx}',
    '../../frontend-components/page-horizontal-navigation/src/**/*.{js,ts,jsx,tsx}',
    '../../frontend-components/hierarchical-navigation/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
