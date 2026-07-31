/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.tsx',
    './src/app/**/*.ts',
    './src/app/**/*.jsx',
    './src/app/**/*.js',
    './src/components/**/*.tsx',
    './src/components/**/*.ts',
    './src/components/**/*.jsx',
    './src/components/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        brown: {
          DEFAULT: '#5D4037', // Chocolate color
          light: '#8D6E63',
          dark: '#3E2723',
        },
        surface: {
          DEFAULT: '#141416',
          hover: '#1C1C20',
          dark: '#0B0B0C',
        },
        crimson: {
          DEFAULT: '#DC2626',
          hover: '#B91C1C',
        }
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }
    },
  },
  plugins: [],
}
