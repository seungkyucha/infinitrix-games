import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary':    '#0a0a0f',
        'bg-secondary':  '#0f0f1a',
        'bg-card':       '#12121e',
        'bg-card-hover': '#1a1a2e',
        'border-dim':    '#1e1e30',
        'border-glow':   '#6c3cf740',
        'accent-purple': '#6c3cf7',
        'accent-cyan':   '#00d4ff',
        'accent-green':  '#00ff87',
        'accent-yellow': '#ffd700',
        'text-primary':  '#e0e0f0',
        'text-secondary':'#8080a0',
        'text-muted':    '#505070',
      },
      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        mono:  ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-purple': '0 0 20px #6c3cf740, 0 0 40px #6c3cf720',
        'glow-cyan':   '0 0 20px #00d4ff40, 0 0 40px #00d4ff20',
        'glow-green':  '0 0 20px #00ff8740, 0 0 40px #00ff8720',
        'card':        '0 4px 24px rgba(0,0,0,0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'float':      'float 4s ease-in-out infinite',
        'shimmer':    'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
      },
    },
  },
  plugins: [],
}

export default config
