/** @type {import('tailwindcss').Config} */
module.exports = {
  // 1. KEEP dark mode from Main 1
  darkMode: 'class',

  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  theme: {
    extend: {
      // 2. USE the brand colors from Modified (matches CSS variables)
      colors: {
        navy:  { DEFAULT: '#1C2B4B', light: '#2A3F6F' },
        gold:  { DEFAULT: '#C8A84B', light: '#D9BE78' },
        teal:  { DEFAULT: '#5E8A88', light: '#7AA8A6' },
        cream: { DEFAULT: '#F5F0E6', dark:  '#EDE6D6' },
      },

      // 3. KEEP the spacing from Main 1 (so your existing layouts don't break)
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },

      // 4. USE the fonts from Modified (matches CSS)
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'serif'],
        sans:  ['system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};