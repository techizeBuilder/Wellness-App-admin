/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fffe',
          100: '#ccfffe',
          200: '#99fffd',
          300: '#5efffb',
          400: '#1ef4f0',
          500: '#05d9d6',
          600: '#00b3b3',
          700: '#008f8f',
          800: '#006b6b',
          900: '#004d4d', // Deep Teal
          950: '#003333',
        },
        gold: {
          50: '#fffdf0',
          100: '#fff9cc',
          200: '#fff399',
          300: '#ffed5e',
          400: '#ffe01e',
          500: '#ffd700', // Royal Gold
          600: '#e6c200',
          700: '#cc9600',
          800: '#b37400',
          900: '#995200',
        },
        coral: {
          50: '#fff3f0',
          100: '#ffe0db',
          200: '#ffbfb3',
          300: '#ff9182',
          400: '#ff6f61', // Coral Accent
          500: '#ff4d3d',
          600: '#ff2b1a',
          700: '#e6150a',
          800: '#cc0000',
          900: '#b30000',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
}