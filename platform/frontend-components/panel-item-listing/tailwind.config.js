/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{ts,tsx}',
    './dev/**/*.{ts,tsx,html}',
    '../dev-env-url-switcher/src/**/*.{ts,tsx}',
    '../dev-env-url-switcher-nav/src/**/*.{ts,tsx}',
  ],
  theme: { extend: {} },
  plugins: [],
};
