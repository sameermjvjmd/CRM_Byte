/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary color - use as bg-primary, text-primary, etc.
        primary: '#6366F1',
        // Primary shades for hover states, etc.
        'primary-50': '#EEF2FF',
        'primary-100': '#E0E7FF',
        'primary-200': '#C7D2FE',
        'primary-300': '#A5B4FC',
        'primary-400': '#818CF8',
        'primary-500': '#6366F1',
        'primary-600': '#4F46E5',
        'primary-700': '#4338CA',
        'primary-800': '#3730A3',
        'primary-900': '#312E81',
        // Sidebar colors
        sidebar: {
          DEFAULT: '#1E293B',
          foreground: '#CBD5E1',
        }
      }
    },
  },
  plugins: [],
}
