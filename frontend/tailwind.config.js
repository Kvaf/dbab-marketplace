/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#050507',
        'bg-secondary': '#0a0b0f',
        'bg-card': '#111218',
        'bg-card-hover': '#1a1b23',
        'border': 'rgba(255, 255, 255, 0.06)',
        'border-hover': 'rgba(255, 255, 255, 0.12)',
        'accent': '#4ade80',
        'accent-dim': 'rgba(74, 222, 128, 0.15)',
        'text-primary': '#f0f0f5',
        'text-secondary': '#8b8fa3',
        'text-muted': '#5a5d6e',
        'danger': '#ef4444',
        'warning': '#f59e0b',
        'info': '#818cf8',
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Space Mono', 'JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
