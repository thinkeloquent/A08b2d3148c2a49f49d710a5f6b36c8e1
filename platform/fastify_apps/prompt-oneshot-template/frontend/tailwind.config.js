/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    '../../../frontend-components/page-menu-offcanvas-template-layout/src/**/*.{js,ts,jsx,tsx}',
    '../../../frontend-components/page-horizontal-navigation/src/**/*.{js,ts,jsx,tsx}',
    '../../../frontend-components/aiops-prompt-oneshot-template/src/**/*.{js,ts,jsx,tsx}',
    '../../../frontend-components/panel-left-with-nav/src/**/*.{js,ts,jsx,tsx}',
    '../../../frontend-components/panel-left-sidebar-menu-002/src/**/*.{js,ts,jsx,tsx}',
    '../../../frontend-components/panel-left-sidebar-search/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
