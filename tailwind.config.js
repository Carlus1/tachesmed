/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}', './index.html'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'Inter var', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Nunito', 'Inter var', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f5f7fa',
          100: '#e4e7ec',
          200: '#c9d1d9',
          300: '#a0aec0',
          400: '#64748b',
          500: '#3b4252',
          600: '#222738',
          700: '#181c2a',
          800: '#101322',
          900: '#0a0c16',
        },
        accent: {
          100: '#f3e8ff',
          200: '#d8b4fe',
          300: '#a78bfa',
          400: '#7c3aed',
          500: '#6d28d9',
        },
        background: { DEFAULT: '#f8fafc', dark: '#181c2a' },
        surface: { DEFAULT: '#fff', dark: '#23263a' },
        muted: '#e5e7eb',
        border: '#e2e8f0',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(60, 72, 88, 0.05)',
        DEFAULT: '0 2px 8px 0 rgba(60, 72, 88, 0.10)',
        md: '0 4px 12px 0 rgba(60, 72, 88, 0.12)',
        lg: '0 8px 24px 0 rgba(60, 72, 88, 0.14)',
        xl: '0 16px 32px 0 rgba(60, 72, 88, 0.16)',
      },
      borderRadius: { xl: '1.25rem', '2xl': '2rem' },
      animation: {
        'fade-in': 'fade-in 0.4s cubic-bezier(0.4,0,0.2,1)',
        'slide-up': 'slide-up 0.4s cubic-bezier(0.4,0,0.2,1)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};