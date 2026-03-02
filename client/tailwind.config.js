/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        terminal: {
          bg: '#0a0e17',
          card: '#111827',
          border: '#1e293b',
          green: '#22c55e',
          yellow: '#eab308',
          red: '#ef4444',
          gray: '#6b7280',
          accent: '#3b82f6',
        }
      }
    },
  },
  plugins: [],
};
