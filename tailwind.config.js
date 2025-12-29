/** @type {import('tailwindcss').Config} */
const withAlpha = (variable) => ({
  DEFAULT: `rgb(var(${variable}) / <alpha-value>)`,
  50: `rgb(var(${variable}-50) / <alpha-value>)`,
  100: `rgb(var(${variable}-100) / <alpha-value>)`,
  200: `rgb(var(${variable}-200) / <alpha-value>)`,
  300: `rgb(var(${variable}-300) / <alpha-value>)`,
  400: `rgb(var(${variable}-400) / <alpha-value>)`,
  500: `rgb(var(${variable}-500) / <alpha-value>)`,
  600: `rgb(var(${variable}-600) / <alpha-value>)`,
  700: `rgb(var(${variable}-700) / <alpha-value>)`,
  800: `rgb(var(${variable}-800) / <alpha-value>)`,
  900: `rgb(var(${variable}-900) / <alpha-value>)`,
});

module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}', './index.html'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter var', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Use CSS variables defined in src/index.css. This allows runtime theming.
        primary: withAlpha('--color-primary'),
        accent: withAlpha('--color-accent'),
        background: {
          DEFAULT: 'rgb(var(--color-background) / <alpha-value>)',
        },
        surface: {
          DEFAULT: 'rgb(var(--color-surface) / <alpha-value>)',
        },
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
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