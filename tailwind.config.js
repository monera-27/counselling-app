/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // or 'media'
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        secondary: {
          500: '#8b5cf6',
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      fontFamily: {
        // If you add Google Fonts later
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};