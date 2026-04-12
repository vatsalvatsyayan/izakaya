import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0F172A',
          secondary: '#1E293B',
          tertiary: '#273548',
          elevated: '#334155',
        },
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
          DEFAULT: '#F59E0B',
          glow: '#FBBF24',
          subtle: 'rgba(245, 158, 11, 0.1)',
          text: '#FCD34D',
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
        border: {
          DEFAULT: '#334155',
          subtle: '#1E293B',
        },
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
