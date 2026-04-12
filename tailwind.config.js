/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1a56db',
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#1a56db',
          600: '#1446c0',
          700: '#1038a0',
        },
        success: '#16a34a',
        warning: '#d97706',
        danger: '#dc2626',
        muted: '#6b7280',
        border: '#e5e7eb',
        card: '#ffffff',
        background: '#f9fafb',
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
