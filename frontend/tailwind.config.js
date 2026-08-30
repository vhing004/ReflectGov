/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          50: '#f0f5fc',
          100: '#e1ecf8',
          200: '#c3daf2',
          300: '#95bee9',
          400: '#609cdd',
          500: '#3c7ed1',
          600: '#2762bf',
          700: '#1b4d89', // Primary Gov-Tech Blue
          800: '#1b417f',
          900: '#1a386b',
          950: '#0f294a', // Dark Slate Navy
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
