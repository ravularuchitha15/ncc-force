/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#C41E3A',
          50: '#FDE8EC',
          100: '#FAC5CE',
          200: '#F5909F',
          300: '#EF5A70',
          400: '#E82340',
          500: '#C41E3A',
          600: '#9E1830',
          700: '#791226',
          800: '#540D1B',
          900: '#2E0710',
        },
        navy: {
          DEFAULT: '#1B2A4A',
          50: '#E8EBF2',
          100: '#C6CDE0',
          200: '#8E9EC3',
          300: '#566FA6',
          400: '#2B4080',
          500: '#1B2A4A',
          600: '#16233D',
          700: '#111B2F',
          800: '#0C1422',
          900: '#070C14',
        },
        sky: {
          DEFAULT: '#4A90D9',
          50: '#EBF4FC',
          100: '#C9E2F6',
          200: '#93C5ED',
          300: '#5DA8E4',
          400: '#4A90D9',
          500: '#2F78C7',
          600: '#2561A4',
          700: '#1B4A81',
          800: '#12325E',
          900: '#091B3B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px rgba(27, 42, 74, 0.08)',
        'card-hover': '0 8px 24px rgba(27, 42, 74, 0.15)',
        'nav': '0 2px 16px rgba(27, 42, 74, 0.12)',
      },
    },
  },
  plugins: [],
}
