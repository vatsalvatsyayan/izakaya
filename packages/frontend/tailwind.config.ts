import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0f1117',
          secondary: '#1a1d27',
          panel: '#1e2133',
          card: '#252840',
        },
        border: {
          subtle: '#2d3148',
          DEFAULT: '#3d4168',
        },
        status: {
          normal: '#22c55e',
          caution: '#eab308',
          warning: '#f97316',
          critical: '#ef4444',
        },
        accent: {
          blue: '#3b82f6',
          cyan: '#06b6d4',
        },
        // Legacy aliases for unmigrated components
        txt: {
          primary: '#F8FAFC',
          secondary: '#94A3B8',
          tertiary: '#64748B',
          disabled: '#475569',
        },
        healthy: {
          DEFAULT: '#22C55E',
          glow: '#4ADE80',
          subtle: 'rgba(34, 197, 94, 0.1)',
          text: '#86EFAC',
        },
        warning: {
          DEFAULT: '#f97316',
          glow: '#fb923c',
          subtle: 'rgba(249, 115, 22, 0.1)',
          text: '#fdba74',
        },
        critical: {
          DEFAULT: '#EF4444',
          glow: '#F87171',
          subtle: 'rgba(239, 68, 68, 0.1)',
          text: '#FCA5A5',
        },
        action: {
          primary: '#3B82F6',
          'primary-hover': '#2563EB',
        },
        simulation: '#3B82F6',
        info: '#6366F1',
        success: '#22C55E',
        error: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
      },
      fontSize: {
        xs: ['11px', { lineHeight: '16px', letterSpacing: '0.05em' }],
        sm: ['12px', { lineHeight: '16px', letterSpacing: '0.01em' }],
        base: ['14px', { lineHeight: '20px', letterSpacing: '0' }],
        lg: ['16px', { lineHeight: '24px', letterSpacing: '-0.01em' }],
        xl: ['20px', { lineHeight: '28px', letterSpacing: '-0.02em' }],
        '2xl': ['24px', { lineHeight: '32px', letterSpacing: '-0.02em' }],
        '3xl': ['32px', { lineHeight: '40px', letterSpacing: '-0.03em' }],
      },
    },
  },
  plugins: [],
} satisfies Config;
