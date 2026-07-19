import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // NexusGrowth design tokens
        nexus: {
          black:    '#0A0A0F',
          deep:     '#0F0F1A',
          surface:  '#141420',
          panel:    '#1A1A2E',
          border:   '#252540',
          muted:    '#2E2E50',
          accent:   '#6C63FF',
          accentLt: '#8B85FF',
          gold:     '#C9A84C',
          goldLt:   '#E8C96A',
          text:     '#E8E8F0',
          textMuted:'#8888A8',
          success:  '#22C55E',
          warning:  '#F59E0B',
          danger:   '#EF4444',
          info:     '#3B82F6',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['"Inter"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'glass': 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
        'hero-gradient': 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(108,99,255,0.25) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 60%, rgba(201,168,76,0.08) 0%, transparent 60%)',
        'card-gradient': 'linear-gradient(135deg, rgba(108,99,255,0.06) 0%, rgba(201,168,76,0.02) 100%)',
      },
      boxShadow: {
        'glass': '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
        'panel': '0 2px 16px rgba(0,0,0,0.5)',
        'accent': '0 0 32px rgba(108,99,255,0.15)',
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
        'slide-up':   'slide-up 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
} satisfies Config
