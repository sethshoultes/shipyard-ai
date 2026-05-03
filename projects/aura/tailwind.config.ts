import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Midnight palette — dark mode only
        background: '#0a0a0f',
        surface: '#12121a',
        'surface-elevated': '#1a1a25',
        'border-subtle': '#2a2a35',
        'text-primary': '#fafafa',
        'text-secondary': '#a0a0b0',
        'text-muted': '#606070',
        'accent-primary': '#7c7cff',
        'accent-secondary': '#5c5cff',
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#fafafa',
            h1: {
              color: '#fafafa',
              fontWeight: '700',
            },
            h2: {
              color: '#fafafa',
              fontWeight: '600',
            },
            h3: {
              color: '#fafafa',
              fontWeight: '600',
            },
            code: {
              color: '#fafafa',
              backgroundColor: '#1a1a25',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.375rem',
            },
            pre: {
              backgroundColor: '#1a1a25',
              color: '#fafafa',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'SF Mono', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
}

export default config
